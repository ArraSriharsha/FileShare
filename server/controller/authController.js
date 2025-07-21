import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyGoogleToken } from '../config/google.js';
import dotenv from 'dotenv';

dotenv.config();

const generatePassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const hashedPassword = await generatePassword(password);
        const user = await User.create({ name, email, password: hashedPassword });
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        
        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Set to true in production with HTTPS
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async (req, res) => {
    try {
        const { login, password } = req.body;
        
        if (!login || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const user = await User.findOne({ email: login });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Check if user has Google OAuth but no password
        if (user.googleId && !user.password) {
            return res.status(401).json({ 
                message: 'This account was created with Google OAuth. Please use Google Sign-In or set a password first.',
                needsPassword: true 
            });
        }
        
        // Check if user has no password at all
        if (!user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        
        // Set HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true, // Set to true in production with HTTPS
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        
        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        res.status(200).json({ 
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                googleId: user.googleId
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
}

export const setPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Check if user has Google OAuth (has googleId but no password)
        if (!user.googleId) {
            return res.status(400).json({ message: 'This account was not created with Google OAuth' });
        }
        
        // Check if password already exists
        if (user.password) {
            return res.status(400).json({ message: 'Password already set for this account' });
        }
        
        // Hash the new password
        const hashedPassword = await generatePassword(password);
        
        // Update user with password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({ 
            success: true,
            message: 'Password set successfully. You can now use email/password authentication.'
        });
    } catch (error) {
        console.error('Set password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    console.log('Google auth request received');
    console.log('Token provided:', !!token);
    
    if (!token) {
      console.error('No token provided');
      return res.status(400).json({ 
        success: false,
        message: 'Google token is required' 
      });
    }

    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 20) + '...');

    // Verify Google token
    const googleUser = await verifyGoogleToken(token);
    console.log('Google user verified:', googleUser.email);
    
    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });
    console.log('Existing user found:', !!user);
    
    if (!user) {
      // Create new user if doesn't exist
      console.log('Creating new user for Google auth');
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        profilePicture: googleUser.picture,
        isGoogleUser: true
      });
      console.log('New user created:', user._id);
    } else {
      // Update existing user with Google info if needed
      if (!user.googleId) {
        console.log('Updating existing user with Google info');
        user.googleId = googleUser.sub;
        user.isGoogleUser = true;
        if (googleUser.picture) {
          user.profilePicture = googleUser.picture;
        }
        await user.save();
        console.log('User updated with Google info');
      }
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true, // Set to true in production with HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log('Google auth successful for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Google authentication failed: ' + error.message 
    });
  }
};