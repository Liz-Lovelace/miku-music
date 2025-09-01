import express from 'express';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { getPath } from './utils.js';
import { DJ } from './dj.js';
import { addToDownloadQueue } from './downloader.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { getTrackURL } from './storage.js';
import validator from 'validator';
import { RegisterValidator, LoginValidator } from './auth.js';
import { login, registerNewUser, verifyJWT } from './auth.js';

const app = express();
const prisma = new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }));
}

/*
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'dist');
  app.use(express.static(buildPath));

  // Fallback to index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}
*/

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(verifyJWT);

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const loginValidator = new LoginValidator({username, password});
    const isValid = await loginValidator.validate();
    if (!isValid) {
      return res.json({messages: loginValidator.getMessages()});
    }

    let jwt = await login(username, password);
    if (!jwt) {
      return res.json({ messages: { loginPassword: ['Incorrect password'] } });
    }

    res.cookie('authToken', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.json({ messages: { loginOther: ["Something went wrong!"] }});
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password1, password2 } = req.body;
    const registerValidator = new RegisterValidator({username, password1, password2});
    const isValid = await registerValidator.validate()
    if (!isValid) {
      return res.json({messages: registerValidator.getMessages()});
    }
    await registerNewUser(username, password1);

    let jwt = await login(username, password1);
    res.cookie('authToken', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.json({ messages: { registerOther: ["Something went wrong!"] }});
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken').json({quietMessage: 'ok'});
});

app.get('/api/myUserInfo', async (req, res) => {
  if (!req.userId) {
    return res.json({ username: null });
  }

  const user = await prisma.user.findUnique({
    where: { uuid: req.userId },
    select: { username: true }
  });
  
  if (!user) {
    return res.status(500)
  }

  res.json({ username: user.username });
});

app.get('/api/playlist', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  let tracks = await prisma.track.findMany({
    where: { download_status: 'downloaded', ownerId: req.userId },
  });

  tracks = tracks.map(track => ({
    ...track,
    download_url: getTrackURL(track.uuid),
  }));

  res.json(DJ.playlist(tracks));
});

app.post('/api/download-tracks', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  const { url } = req.body;
  
  if (!url || !validator.isURL(url)) {
    return res.status(400).json({ message: 'Invalid URL' });
  }

  try {
    await addToDownloadQueue(url, req.userId);
    res.status(200).json({ message: 'Added to queue :D' });
  } catch (error) {
    console.error('Error adding track to download queue:', error);
    res.status(500).json({ message: 'Failed to add track to download queue' });
  }
});

app.get('/api/track-queue', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  res.json(await prisma.track.findMany({
    where: { ownerId: req.userId },
    orderBy: [{ createdAt: 'desc' }],
  }));
});

app.post('/api/listened', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  const track = await prisma.track.update({
    where: { uuid: req.body.uuid, ownerId: req.userId },
    data: { times_listened: { increment: 1 } },
  });
  res.json({ status: 'success' });
});

app.post('/api/vote', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  const { uuid, vote } = req.body;
  try {
    const track = await prisma.track.findUnique({ where: { uuid, ownerId: req.userId } });
    if (!track) {
      return res.status(404).json({ status: 'error', message: 'Track not found' });
    }

    const newUpvotes = Math.max(0, track.upvotes + vote);

    const updatedTrack = await prisma.track.update({
      where: { uuid, ownerId: req.userId },
      data: { upvotes: newUpvotes },
    });

    res.json({ status: 'success', upvotes: updatedTrack.upvotes });
  } catch (error) {
    console.error('Error voting on track:', error);
    res.status(500).json({ status: 'error', message: 'Failed to vote on track' });
  }
});

app.post('/api/delete-track', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  const { uuid } = req.body;
  try {
    const updatedTrack = await prisma.track.update({
      where: { uuid, ownerId: req.userId },
      data: { download_status: 'deleted' },
    });
    res.json({ track: updatedTrack });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ message: 'Failed to delete track' });
  }
});

app.post('/api/redownload-track', async (req, res) => {
  if (!req.userId) {
    return res.json({});
  }

  const { uuid } = req.body;
  try {
    await prisma.track.update({
      where: { uuid, ownerId: req.userId },
      data: { download_status: 'awaiting download' },
    });
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error restarting track download:', error);
    res.status(500).json({ message: 'Failed to restart track download' });
  }
});

app.listen(1273, () => {
  console.log('miku-music backend is listening on http://localhost:1273');
});
