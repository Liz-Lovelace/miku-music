import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import shortUUID from 'short-uuid';
import v from 'validator';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length <= 32) {
  console.error('Error: JWT_SECRET must be longer than 32 characters');
  process.exit(1);
}

class Validator {
  messages = {};

  constructor(data) {
    this.data = data;
  }

  async validate() {
    try {
      await this.rules();
    } catch (err) {
      console.error('Validation error!');
      console.error(err);
      this.messages["other"] = ['Something broke while validating your data :('];
    }

    return this.isValid();
  }

  async rules() {
    throw new Error('You must implement the rules method');
  }

  assertNot(condition, errorType, message) {
    this.assert(!condition, errorType, message);
  }

  assert(condition, errorType, message) {
    if (condition) {
      return;
    }
    if (!this.messages[errorType]) {
      this.messages[errorType] = [];
    }
    this.messages[errorType].push(message);
  }

  isValid() {
    return Object.keys(this.messages).length == 0;
  }

  getMessages() {
    return this.messages;
  }
}

export class RegisterValidator extends Validator {
  async rules() {
    let type = 'registerPassword';
    this.assert(this.data.password1, type, 'Please provide a password');
    this.assert(v.isLength(this.data.password1, {min: 14}), type, 'Password must be at least 14 characters long');

    type = 'registerPasswordRepeat';
    this.assert(this.data.password1 === this.data.password2, type, 'Passwords must match');

    type = 'registerUsername';
    this.assert(this.data.username, type, 'Please provide a username');
    this.assert(v.isWhitelisted(this.data.username, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'), type, 'Username can contain English letters, numbers, underscores, or dashes');
    this.assert(v.isLength(this.data.username, {max: 200}), type, 'Username must be shorter than 200 characters lmao');
    
    const existingUser = await prisma.user.findUnique({ where: { usernameLowercase: this.data.username.toLowerCase() } });
    this.assertNot(existingUser, type, 'Username taken');
  }
}

export class LoginValidator extends Validator {
  async rules() {
    let type = 'loginPassword';
    this.assert(this.data.password, type, 'Please provide a password');

    type = 'loginUsername';
    this.assert(this.data.username, type, 'Please provide a username');
    
    // Replace findUserByUsername with Prisma query
    const existingUser = await prisma.user.findUnique({ where: { usernameLowercase: this.data.username.toLowerCase() } });
    this.assert(existingUser, type, 'Username not found');
  }
}

export async function registerNewUser(username, password) {
  const salt = bcrypt.genSaltSync(12);

  await prisma.user.create({
    data: {
      uuid: shortUUID.generate(),
      username,
      usernameLowercase: username.toLowerCase(),
      passwordHash: hash(password, salt),
      salt,
    },
  });
}

export async function login(username, password) {
  const user = await prisma.user.findUnique({ where: { usernameLowercase: username.toLowerCase() } });
  if (user && isCorrectPassword(user, password)) {
    return jwt.sign({ sub: user.uuid }, process.env.JWT_SECRET);
  }
}

function isCorrectPassword(user, password) {
  return hash(password, user.salt) === user.passwordHash;
}

function hash(password, salt) {
  return bcrypt.hashSync(password, salt);
}

export function verifyJWT(req, res, next) {
  const token = req.cookies.authToken;
  req.userId = null;

  try {
    const jwtContent = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = jwtContent.sub;
  } catch (err) { }

  next();
}

