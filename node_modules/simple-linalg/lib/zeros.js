/**
 * Generates a 2D array filled with zeros with the specified number of rows and columns.
 * @param {number} rows The number of rows for the 2D array.
 * @param {number} cols The number of columns for the 2D array.
 * @returns {number[][]} A 2D array filled with zeros.
 */
module.exports = function zeros(rows, cols) {
	return new Array(rows).fill(1).map(() => new Array(cols).fill(0));
};
