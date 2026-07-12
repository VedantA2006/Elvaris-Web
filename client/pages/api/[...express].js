import app from '../../src/server/app.js';
import connectDB from '../../src/lib/db.js';

// Connect to DB once when the serverless function spins up
let dbConnected = false;

export default async function handler(req, res) {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }

  return new Promise((resolve, reject) => {
    // We let Express handle the request and response
    app(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Tell Next.js not to parse the body so Express can do it
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
