/**
 * Maps a function over each element of the given matrix.
 * @param {Array<Array<any>>} a The matrix to map over.
 * @param {function(any, number, number): any} fn The mapping function to apply.
 * @returns {Array<Array<any>>} The matrix with the function applied to each element.
 */
module.exports = function mapMatrix(a, fn) {
	return a.map((row, rowId) => row.map((cell, colId) => fn(cell, rowId, colId)));
};
