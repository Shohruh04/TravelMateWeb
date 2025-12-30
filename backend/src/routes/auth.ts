import { Hono } from 'hono';
import { z } from 'zod';
import {
  registerUser,
  loginUser,
  updateUserProfile,
  changePassword,
} from '../services/authService';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { email, password, name } = validationResult.data;

    // Register user
    const result = await registerUser({ email, password, name });

    return c.json(
      {
        message: 'User registered successfully',
        user: result.user,
        token: result.token,
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return c.json(
          {
            error: 'Conflict',
            message: error.message,
          },
          409
        );
      }

      return c.json(
        {
          error: 'Bad Request',
          message: error.message,
        },
        400
      );
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to register user',
      },
      500
    );
  }
});

/**
 * POST /api/auth/login
 * Login a user
 */
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { email, password } = validationResult.data;

    // Login user
    const result = await loginUser({ email, password });

    return c.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid email or password')) {
        return c.json(
          {
            error: 'Unauthorized',
            message: 'Invalid email or password',
          },
          401
        );
      }
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to login',
      },
      500
    );
  }
});

/**
 * GET /api/auth/me
 * Get current user information (requires authentication)
 */
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');

    return c.json({
      user,
    });
  } catch (error) {
    console.error('Get user error:', error);

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to retrieve user information',
      },
      500
    );
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile (requires authentication)
 */
auth.put('/profile', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: validationResult.error.errors,
        },
        400
      );
    }

    // Update profile
    const updatedUser = await updateUserProfile(user.id, validationResult.data);

    return c.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    if (error instanceof Error) {
      if (error.message.includes('already in use')) {
        return c.json(
          {
            error: 'Conflict',
            message: error.message,
          },
          409
        );
      }

      return c.json(
        {
          error: 'Bad Request',
          message: error.message,
        },
        400
      );
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      },
      500
    );
  }
});

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
auth.post('/change-password', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    // Validate input
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return c.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: validationResult.error.errors,
        },
        400
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Change password
    await changePassword(user.id, currentPassword, newPassword);

    return c.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);

    if (error instanceof Error) {
      if (error.message.includes('incorrect')) {
        return c.json(
          {
            error: 'Unauthorized',
            message: error.message,
          },
          401
        );
      }

      return c.json(
        {
          error: 'Bad Request',
          message: error.message,
        },
        400
      );
    }

    return c.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to change password',
      },
      500
    );
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side only, just returns success)
 * Client should remove token from storage
 */
auth.post('/logout', authMiddleware, async (c) => {
  return c.json({
    message: 'Logout successful',
  });
});

export default auth;
