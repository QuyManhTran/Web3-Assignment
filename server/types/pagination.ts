export interface Pagination {
    perPage: number
    curPage: number
}

export interface PaginationMeta {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
}

declare module '@adonisjs/core/http' {
    interface HttpContext {
        pagination: Pagination
    }
}
