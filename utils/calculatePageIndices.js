/**
 * @desc    Pagination
 * @param   page - The page of data to be returned
 * @param   limit - The number of data to be returned
 * @param   total - The total number of data
 * @returns { startIndex, pagination }
 **/
const calculatePageIndices = (page, limit, total) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const pages = Math.ceil(total / limit);

  const pagination = {
    total,
    pages: pages,
  };

  if (total === 0) return { startIndex, pagination };

  // Throw error if page number is not available
  if (page > pages) {
    const error = new Error(
      `The requested page number is not available. Please enter a valid page number between 1 and ${pages}.`
    );
    error.statusCode = 400;
    throw error;
  }

  // +page, +limit are a method to convert string to number
  if (endIndex < total) {
    pagination.next = {
      page: +page + 1,
      limit: +limit,
    };
  }
  if (startIndex > 0 && page <= pages) {
    pagination.prev = {
      page: page - 1,
      limit: +limit,
    };
  }

  pagination.current = {
    page: +page,
    limit: +limit,
  };

  return { startIndex, pagination };
};

export default calculatePageIndices;
