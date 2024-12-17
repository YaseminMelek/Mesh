const matrixInverse = require('matrix-inverse');

module.exports = function invert(m) {
	return matrixInverse(m);
};
