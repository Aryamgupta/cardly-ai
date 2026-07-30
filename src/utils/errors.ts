export class AppError extends Error {
  statusCode: number;
  originalError?: unknown;

  constructor(message: string, statusCode = 500, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) {
    return err;
  }
  
  if (err instanceof Error) {
    return new AppError(err.message, 500, err);
  }
  
  if (typeof err === 'string') {
    return new AppError(err, 500);
  }
  
  // Handle objects with a message property, e.g. some third-party errors
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return new AppError((err as any).message, 500, err);
  }
  
  return new AppError('An unknown error occurred', 500, err);
}
