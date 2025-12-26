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

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Explicitly select password since we set select: false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ 
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
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
