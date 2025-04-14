export const pagination = (query, totalitems, objectPagination) => {
  const { page, limit } = objectPagination;

  const totalPages = Math.ceil(totalitems / limit);
  const currentPage = parseInt(page) || 1;
  const offset = (currentPage - 1) * limit;

  const paginatedQuery = {
    ...query,
    skip: offset,
    limit: parseInt(limit),
  };

  return {
    paginatedQuery,
    totalPages,
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    nextPage: currentPage + 1 > totalPages ? null : currentPage + 1,
    previousPage: currentPage - 1 < 1 ? null : currentPage - 1,
  };
}