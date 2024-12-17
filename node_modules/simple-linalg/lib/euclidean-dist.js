/**
 * Calculates the Euclidean distance between two vectors.
 * @param {number[]} array1 The first vector.
 * @param {number[]} array2 The second vector.
 * @returns {number} The Euclidean distance between the two vectors.
 * @throws {Error} If the arrays have different lengths or if either array is not an array.
 */
module.exports = function euclideanDist(array1, array2) {
	if (array1.length !== array2.length) {
		throw new Error('Invalid array lengths');
	}

	if (!Array.isArray(array1)) {
		console.log({array1});
		throw new Error('Invalid array');
	}

	const diff = array1.map((element, index) => element - array2[index]).map(element => element * element);
	return Math.sqrt(diff.reduce((a, b) => a + b));
};
