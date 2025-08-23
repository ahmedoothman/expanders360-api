import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.url;

    return next.handle().pipe(
      map((data: T): ApiResponseDto<T> => {
        // If data is already wrapped in our standard format, return as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'timestamp' in data &&
          'message' in data &&
          'path' in data
        ) {
          return data as unknown as ApiResponseDto<T>;
        }

        // For responses that have a message property, use it
        let message = 'Operation successful';
        let responseData: T | undefined = data;

        if (data && typeof data === 'object' && 'message' in data) {
          const dataObj = data as Record<string, any>;
          message =
            typeof dataObj.message === 'string' ? dataObj.message : message;

          // Remove message from data if it exists, to avoid duplication
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { message: _, ...cleanData } = dataObj;
          responseData =
            Object.keys(cleanData).length > 0 ? (cleanData as T) : undefined;
        }

        return ApiResponseDto.success(message, responseData, path);
      }),
    );
  }
}
