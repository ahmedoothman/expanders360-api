import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

interface ExceptionResponseObject {
  message?: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const responseObj = exceptionResponse as ExceptionResponseObject;
      message = Array.isArray(responseObj.message)
        ? responseObj.message.join(', ')
        : responseObj.message || responseObj.error || 'An error occurred';
      error = Array.isArray(responseObj.message)
        ? responseObj.message.join(', ')
        : responseObj.message || responseObj.error || exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = exception instanceof Error ? exception.message : 'Unknown error';
    }

    const errorResponse = ApiResponseDto.error(message, error, path);

    response.status(status).json(errorResponse);
  }
}
