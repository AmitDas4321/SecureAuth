import axios from 'axios';

const DB_URL = process.env.FIREBASE_DATABASE_URL?.replace(/\/$/, '') || '';
const DB_SECRET = process.env.FIREBASE_DATABASE_SECRET || '';

const db = axios.create({
  baseURL: DB_URL,
  params: {
    auth: DB_SECRET,
  },
});

export const firebaseDb = {
  async get<T>(path: string): Promise<T | null> {
    const response = await db.get(`${path}.json`);
    return response.data;
  },
  
  async put<T>(path: string, data: T): Promise<T> {
    const response = await db.put(`${path}.json`, data);
    return response.data;
  },
  
  async post<T>(path: string, data: T): Promise<{ name: string }> {
    const response = await db.post(`${path}.json`, data);
    return response.data;
  },
  
  async patch<T>(path: string, data: Partial<T>): Promise<T> {
    const response = await db.patch(`${path}.json`, data);
    return response.data;
  },
  
  async delete(path: string): Promise<void> {
    await db.delete(`${path}.json`);
  },
};
