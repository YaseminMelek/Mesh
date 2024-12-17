/**
 * Transposes the given 2D array.
 * @param {Array<Array<any>>} array The 2D array to transpose.
 * @returns {Array<Array<any>>} The transposed 2D array.
 */
module.exports = function transpose(array) {
	return array[0].map((col, i) => array.map(row => row[i]));
};
