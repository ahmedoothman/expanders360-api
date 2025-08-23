export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
}

export class ApiResponseDto<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: string,
    path?: string,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.timestamp = new Date().toISOString();
    this.path = path || '';
  }

  static success<T>(
    message: string,
    data?: T,
    path?: string,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(true, message, data, undefined, path);
  }

  static error(
    message: string,
    error?: string,
    path?: string,
  ): ApiResponseDto<null> {
    return new ApiResponseDto(false, message, null, error, path);
  }
}
