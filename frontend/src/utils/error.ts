import { AxiosError } from 'axios';

export interface NormalizedError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}

export function normalizeError(error: unknown): NormalizedError {
  if (!error) {
    return { message: 'An unknown error occurred' };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  const axiosError = error as AxiosError<any>;

  if (axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    let message = '';
    const fieldErrors: Record<string, string> = {};

    if (data) {
      // 1. Check if backend returned wrapped response with message
      if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message;
      }
      
      // 2. SimpleJWT or DRF standard error formats
      if (data.detail && typeof data.detail === 'string') {
        message = data.detail;
      }

      // 3. Process DRF field validation errors e.g. { username: ["This field is required"], non_field_errors: [...] }
      if (typeof data === 'object' && !Array.isArray(data)) {
        Object.keys(data).forEach((key) => {
          if (key === 'message' || key === 'success' || key === 'status_code') return;

          const val = data[key];
          if (Array.isArray(val) && val.length > 0) {
            fieldErrors[key] = val.map((v) => (typeof v === 'string' ? v : JSON.stringify(v))).join(' ');
            if (!message && key !== 'non_field_errors') {
              message = `${key}: ${fieldErrors[key]}`;
            } else if (!message && key === 'non_field_errors') {
              message = fieldErrors[key];
            }
          } else if (typeof val === 'string') {
            fieldErrors[key] = val;
            if (!message) message = val;
          }
        });
      }
    }

    // Default status messages if message could not be parsed
    if (!message) {
      switch (status) {
        case 400:
          message = 'Invalid request payload or parameters.';
          break;
        case 401:
          message = 'Authentication required or token expired.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 429:
          message = 'Too many requests. Please slow down and try again later.';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        default:
          message = `HTTP Error ${status}`;
      }
    }

    return {
      message,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
      statusCode: status,
    };
  }

  if (axiosError.request) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection or backend server state.',
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unexpected error occurred' };
}
