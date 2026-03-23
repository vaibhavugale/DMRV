import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ error: 'Email already registered.' });
      return;
    }

    const user = new User({
      userId: uuidv4(),
      email,
      passwordHash: password,
      firstName,
      lastName,
      role: role || 'enumerator',
    });

    await user.save();

    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
