/**
 * Calculates the Euclidean norm of the given vector.
 * @param {number[]} vector The vector for which to calculate the Euclidean norm.
 * @returns {number} The Euclidean norm of the vector.
 */
module.exports = function norm(vector) {
	let result = 0;
	for (const element of vector) {
		result += (element * element);
	}
	return Math.sqrt(result);
};
