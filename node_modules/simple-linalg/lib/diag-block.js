const identity = require('./identity.js');

/**
 * Constructs a block diagonal matrix from the given blocks.
 * @param {Object} options The options object.
 * @param {number[][][]} options.blocks The blocks to form the diagonal matrix.
 * @param {number[]} [options.order=null] Optional order for arranging the blocks.
 * @returns {number[][]} The block diagonal matrix.
 */
module.exports = function diagBlock({blocks, order = null}) {
	const dimL = blocks.map(a => a.length).reduce((a, b) => a + b, 0);
	const result = identity(dimL);
	let current = 0;
	for (const mat of blocks) {
		for (const [i] of mat.entries()) {
			for (const [j] of mat.entries()) {
				result[i + current][j + current] = mat[i][j];
			}
		}

		current += mat.length;
	}

	if (order) {
		return order.map(i => order.map(j => result[i][j]));
	}

	return result;
};
