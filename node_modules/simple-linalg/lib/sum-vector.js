/**
 * Sums all the elements of the given vector.
 * @param {number[]} vector The vector whose elements are to be summed.
 * @returns {number} The sum of all elements in the vector.
 */
module.exports = function sumVector(vector) {
	let s = 0;
	for (const element of vector) {
		s += element;
	}
	return s;
};
