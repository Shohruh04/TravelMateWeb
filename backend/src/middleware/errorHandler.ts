import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Custom Error Types
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Error Handler Middleware
 * Centralized error handling with proper logging and response formatting
 */
export const errorHandler = (err: Error, c: Context) => {
  console.error('Error occurred:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: c.req.path,
    method: c.req.method,
  });

  // Handle HTTP exceptions from Hono
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  // Handle validation errors
  if (err instanceof ValidationError) {
    return c.json(
      {
        error: 'Validation Error',
        message: err.message,
      },
      400
    );
  }

  // Handle not found errors
  if (err instanceof NotFoundError) {
    return c.json(
      {
        error: 'Not Found',
        message: err.message,
      },
      404
    );
  }

  // Handle database errors
  if (err instanceof DatabaseError || err.name === 'PrismaClientKnownRequestError') {
    return c.json(
      {
        error: 'Database Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred while processing your request',
      },
      500
    );
  }

  // Handle generic errors
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    },
    500
  );
};

/**
 * Logger Middleware
 * Logs incoming requests for debugging and monitoring
 */
export const logger = async (c: Context, next: any) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`);
};
