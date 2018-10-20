/**
 * @function pagination
 * @param {number} count
 * @param {number} limit
 * @param {number} offset
 * @returns {object} return an object with the page
 */
export default (count, limit, offset) => {
  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.ceil(count / limit);
  return { page, pageCount, count };
};
