import { PrismaClient } from '@prisma/client';
import YTDLP from 'yt-dlp-wrap';
import { getPath } from './utils.js';
import shortUUID from 'short-uuid';
import { uploadBuffer, getTrackURL } from './storage.js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import Bottleneck from 'bottleneck';

dotenv.config();

const prisma = new PrismaClient();
let YTDlpConstructor = YTDLP;
// because bun and node handle this differently
if (YTDLP.default) {
  YTDlpConstructor = YTDLP.default;
}
const YTDlpPath = getPath('./yt-dlp');
// UNCOMMENT THIS TO DOWNLOAD THE LATEST YT-DLP BINARY
// todo: this should really like, conditionally download it only if it's not already in the path
/*
downloadYTDlp();
async function downloadYTDlp() {
  let githubReleasesData = await YTDlpConstructor.getGithubReleases(1, 5);
  console.log('downloading ytdlp');
  await YTDlpConstructor.downloadFromGithub(
      YTDlpPath
  );
  console.log('ytdlp downloaded');
}
*/
const downloader = new YTDlpConstructor(YTDlpPath);

const limiter = new Bottleneck({
  maxConcurrent: 30,
  minTime: 200,
});

let inProgress = new Set();

queueLoop();
async function queueLoop() {
  while (true) {
    await updateQueue();
    await new Promise(resolve => setTimeout(resolve, 800));
  }
}


async function updateQueue() {
  const tracks = await prisma.track.findMany({
    where: { download_status: 'awaiting download' },
  });
  tracks.map(addTrackToInProgress);
}

function addTrackToInProgress(track) {
  if (inProgress.has(track.uuid)) {
    return;
  }
  inProgress.add(track.uuid);

  limiter.schedule(async () => {
    let timeout = new Promise((resolve, reject) => setTimeout(reject, 60000));
    let trackProcess = processTrack(track)
    try {
      await Promise.race([timeout, trackProcess]);
      await prisma.track.update({ 
        where: { uuid: track.uuid },
        data: { download_status: 'downloaded' },
      });
    } catch (error) {
      console.error(`Error processing track ${track.title}:`, error);
      await prisma.track.update({ 
        where: { uuid: track.uuid },
        data: { download_status: 'error' },
      });
    } finally {
      inProgress.delete(track.uuid);
    }
  });
}

async function processTrack(track) {
  console.log(`downloading ${track.title}`);
  let trackBuffer = await downloadURL(track.track_url);
  await uploadBuffer(process.env.S3_TRACKS_BUCKET_NAME, `${track.uuid}.mp3`, trackBuffer);
}

async function downloadURL(trackURL) {
  let trackStream = downloader.execStream([
    trackURL,
    '--extract-audio',
    '--audio-format',
    'mp3',
  ]);
  return new Promise((resolve, reject) => {
    const chunks = [];
    trackStream.on('data', (chunk) => chunks.push(chunk));
    trackStream.on('end', () => resolve(Buffer.concat(chunks)));
    trackStream.on('error', reject);
  });
}

export async function addToDownloadQueue(url, userId) {
  let tracks = await fetchTracksMetadata(url);
  for (let track of tracks) {
    if (await isDuplicate(track, userId)) {
      console.log(`track already exists, skipping ${track.title}`);
      continue;
    }
    await prisma.track.create({ data: {
     ...track,
     ownerId: userId,
     download_status: 'awaiting download'
    }});  
    console.log(`added track to queue: ${track.title}`);
  }
}

async function fetchTracksMetadata(url) {
  let metadata = await downloader.getVideoInfo(url);
  console.log('\ndownloaded metadata');
  metadata = Array.isArray(metadata) ? metadata : [metadata];
  return metadata.map(metadataToTrack);
}

function metadataToTrack(md) {
  return {
    uuid: shortUUID.generate(),
    title: md.track || assertProperty(md, 'title'),
    // ext is hard-coded into the downloader
    ext: 'mp3',
    album: md.album || null,
    length: assertProperty(md, 'duration'),
    extractor: md.extractor,
    track_url: assertProperty(md, 'original_url'),
    image_url: md.thumbnail || null,
  };
}

function assertProperty(metadata, property) {
  if (metadata[property] !== undefined) {
    return metadata[property];
  }
  else {
    throw new Error(`track property "${property} is undefined! (${metadata.title} ${metadata.original_url})`);
  }
}

async function isDuplicate(track, userId) {
  const duplicate = await prisma.track.findFirst({
    where: { 
      track_url: track.track_url,
      ownerId: userId,
    }
  });
  return !!duplicate;
}