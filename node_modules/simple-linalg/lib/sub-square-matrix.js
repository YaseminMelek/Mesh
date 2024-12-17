/**
 * Extracts a sub-square matrix from the provided matrix based on the given indexes.
 * @param {number[][]} mat The matrix from which to extract the sub-square matrix.
 * @param {number[]} indexes The indexes to select rows and columns from the matrix.
 * @returns {number[][]} The sub-square matrix extracted from the original matrix.
 */
module.exports = function subSquareMatrix(mat, indexes) {
	return indexes.map(s1 => indexes.map(s2 => mat[s1][s2]));
};
