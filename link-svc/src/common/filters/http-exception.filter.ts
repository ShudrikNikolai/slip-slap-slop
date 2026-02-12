import { IApiResponse } from '@/common/interfaces/api-response.interface';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        let errors: any[] = [];

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                errors = (exceptionResponse as any).errors || [];
            }
        } else if (exception instanceof Error) {
            message = `${exception.name}: ${exception.message}`;
        }

        console.error(`[${request.method}] ${request.url}`, {
            status,
            message,
            stack: exception.stack,
            body: request.body,
            params: request.params,
            query: request.query,
        });

        const apiResponse: IApiResponse = {
            status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        response.status(status).json(apiResponse);
    }
}
