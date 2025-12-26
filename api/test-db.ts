import dbConnect from './db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const conn = await dbConnect();
    if (!conn) {
        return res.status(500).json({ status: 'error', message: 'Database connection failed or URI not provided' });
    }
    const state = conn.connection.readyState;
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    const statusMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    res.status(200).json({ 
        status: 'ok', 
        dbState: statusMap[state] || 'unknown',
        message: 'Connected to MongoDB successfully' 
    });
  } catch (e: any) {
    console.error("DB Connection Error:", e);
    res.status(500).json({ status: 'error', message: e.message });
  }
}
