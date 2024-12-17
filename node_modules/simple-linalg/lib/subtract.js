const elemWise = require('./elem-wise');

module.exports = function subtract(...args) {
	return elemWise(args, ([a, b]) => a - b);
};
