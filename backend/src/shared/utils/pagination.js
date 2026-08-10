export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

export function normalizePagination({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) {
  const safePage = Math.max(Number(page) || DEFAULT_PAGE, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
    take: safeLimit
  };
}

export function buildPaginationMeta(total, { page, limit }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  };
}
