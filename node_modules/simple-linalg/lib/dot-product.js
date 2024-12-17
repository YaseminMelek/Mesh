/**
 * Calculates the dot product of two vectors.
 * @param {number[]} vector1 The first vector.
 * @param {number[]} vector2 The second vector.
 * @returns {number} The dot product of the two vectors.
 * @throws {Error} If the lengths of the vectors do not match.
 */
module.exports = function dotProduct(vector1, vector2) {
	if (vector1.length !== vector2.length) {
		throw (new Error('Lengths not maching'));
	}

	let result = 0;
	for (const [i, element] of vector1.entries()) {
		result += element * vector2[i];
	}

	return result;
};
