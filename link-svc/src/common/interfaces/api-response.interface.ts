export interface IApiResponse<T = any> {
    status: number;
    message?: string;
    data?: T;
    errors?: any[];
    timestamp: string;
    path?: string;
    query?: Record<string, any>;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        filters?: Record<string, any>;
        sort?: string;
    };
}

export interface IQueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'ASC' | 'DESC';
    [key: string]: any;
}
