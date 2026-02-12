import { IApiResponse, IPaginatedResponse } from '@/common/interfaces/api-response.interface';
import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<IApiResponse<T>> | Promise<Observable<IApiResponse<T>>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse();

        const statusCode = response.statusCode || HttpStatus.OK;
        const queryParams = request.query;

        return next.handle().pipe(
            map((data) => {
                if (this.isApiResponse(data)) {
                    return {
                        ...data,
                        timestamp: new Date().toISOString(),
                        path: request.url,
                        query: this.extractRelevantQueryParams(queryParams),
                    };
                }

                if (this.isPaginated(data)) {
                    return this.formatPaginatedResponse(data, request, queryParams, statusCode);
                }

                return this.formatResponse(data, request, queryParams, statusCode);
            }),
        );
    }

    private formatResponse(data: any, request: Request, queryParams: any, status: number): IApiResponse {
        return {
            status,
            data,
            timestamp: new Date().toISOString(),
            path: request.url,
            query: this.extractRelevantQueryParams(queryParams),
        };
    }

    private formatPaginatedResponse(
        data: any,
        request: Request,
        queryParams: any,
        status: number,
    ): IPaginatedResponse<any> {
        const { items, meta } = data;
        const { page, limit, total } = meta;
        const totalPages = Math.ceil(total / limit);

        return {
            status,
            data: items,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            query: this.extractRelevantQueryParams(queryParams),
        };
    }

    private extractRelevantQueryParams(queryParams: any): Record<string, any> | undefined {
        const relevantParams: Record<string, any> = {};

        Object.keys(queryParams).forEach((key) => {
            if (queryParams[key] !== undefined && queryParams[key] !== '') {
                relevantParams[key] = queryParams[key];
            }
        });

        return Object.keys(relevantParams).length > 0 ? relevantParams : undefined;
    }

    private isApiResponse(data: any): boolean {
        return data && typeof data === 'object' && 'status' in data;
    }

    private isPaginated(data: any): boolean {
        return data && typeof data === 'object' && 'items' in data && 'meta' in data;
    }
}
