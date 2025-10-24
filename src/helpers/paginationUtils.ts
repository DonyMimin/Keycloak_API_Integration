export function resolvePagination<T extends string>(
  params: {
    page: number;
    size: number;
    sort?: Record<string, any>;
  },
  validSortFields: T[],
  defaultSort: T
) {
  const page = Math.max(params.page ?? 1, 1);
  const size = Math.max(params.size ?? 10, 1);
    const skip = (page - 1) * size;

    const rawSort = params.sort || {};
    const sort_by: Record<T, 'asc' | 'desc'> = {} as any;

    let hasValidSort = false;

    for (const [field, direction] of Object.entries(rawSort)) {
        if (
        validSortFields.includes(field as T) &&
        (direction === 'asc' || direction === 'desc')
        ) {
        sort_by[field as T] = direction;
        hasValidSort = true;
        }
    }

    // Fallback to default sort if none valid
    if (!hasValidSort) {
        sort_by[defaultSort] = 'asc';
    }

    return { page, size, skip, sort_by };
}
