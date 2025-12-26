import dbConnect from '../../db';
import User from '../models/User';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ 
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
    res.status(401).json({ error: 'Invalid token' });
  }
}
