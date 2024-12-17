const dotProduct = require('./dot-product.js');
const norm = require('./norm.js');

/**
 * Calculates the cosine similarity between two vectors.
 * @param {number[]} vector1 The first vector.
 * @param {number[]} vector2 The second vector.
 * @returns {number} The cosine similarity between the two vectors.
 * @throws {Error} If the lengths of the vectors do not match.
 */
module.exports = function cosSimilarity(vector1, vector2) {
	if (vector1.length !== vector2.length) {
		throw (new Error('The lengths of the vectors do not match'));
	}

	const normProd = (norm(vector1) * norm(vector2));

	if (normProd === 0) {
		return 0;
	}

	return dotProduct(vector1, vector2) / normProd;
};
