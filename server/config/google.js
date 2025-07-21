import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';


const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    console.log('Verifying Google token with client ID:', GOOGLE_CLIENT_ID);
    
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    console.log('Google token verified successfully for user:', payload.email);
    
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub, // Google's unique user ID
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    console.error('Expected client ID:', GOOGLE_CLIENT_ID);
    console.error('Token audience mismatch - make sure frontend and backend use the same Google Client ID');
    throw new Error('Invalid Google token - Client ID mismatch');
  }
};

export { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET }; 