const zeros = require('./zeros');

/**
 * Constructs a diagonal matrix from the given array.
 * @param {number[]} diagonal The array representing the diagonal elements of the matrix.
 * @returns {number[][]} The diagonal matrix.
 */
module.exports = function diag(diagonal) {
	const result = zeros(diagonal.length, diagonal.length);
	for (const [i, element] of diagonal.entries()) {
		result[i][i] = element;
	}
	return result;
};
