export type SortOrder = 'asc' | 'desc';

export interface PaginationQueryParams {
    page: number;
    size: number;
    search?: string;
    sort?: Record<string, any>
    order?: SortOrder;
    language?: string;
}
