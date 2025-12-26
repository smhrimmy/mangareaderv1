import dbConnect from '../../db';
import User from '../models/User';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      favorite_genres: [],
      theme: 'dark'
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
        bio: user.bio,
        favorite_genres: user.favorite_genres,
        theme: user.theme
      }
    });

  } catch (error: any) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
