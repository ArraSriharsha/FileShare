import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const protect = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized, no token' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized, user not found' });
      }
  
      req.userId = user._id;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized, invalid token' });
    }
  };
export default protect;