const trace = require('./trace.js');
const transpose = require('./transpose.js');
const matSub = require('./subtract.js');
const matMul = require('./mat-mul.js');
const sum = require('./sum.js');

/**
 * Calculates the Frobenius norm of the given matrices or vectors.
 * [Frobenius norm](https://en.wikipedia.org/wiki/Matrix_norm#Frobenius_norm)
 * @param {number[][]} [array1] The first matrix or vector (optional).
 * @param {number[][]} [array2] The second matrix or vector (optional).
 * @returns {number} The Frobenius norm of the matrices or vectors.
 */
module.exports = function frobenius(array1, array2) {
	if (array1 === undefined) {
		return sum(array2);
	}

	if (array2 === undefined) {
		return sum(array1);
	}

	const m = matSub(array1, array2);
	const p = matMul(transpose(m), m);
	return Math.sqrt(trace(p));
};
