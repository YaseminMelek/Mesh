declare module 'simple-linalg' {
    /**
    * Add matrixes together
    * @param {...Array.<Array.<Number>>} args list of matrix
    * @returns {Array.<Array.<Number>>} sum
    */
    export function add(...matrices: number[][][]): number[][];
    /**
     * Calculates the cosine similarity between two vectors.
     * @param {number[]} vector1 The first vector.
     * @param {number[]} vector2 The second vector.
     * @returns {number} The cosine similarity between the two vectors.
     * @throws {Error} If the lengths of the vectors do not match.
     */
	export function cosSimilarity(vector1: number[], vector2: number[]): number;
	/**
     * Constructs a diagonal matrix from the given array.
     * @param {number[]} diagonal The array representing the diagonal elements of the matrix.
     * @returns {number[][]} The diagonal matrix.
     */
	export function diag(diagonal: number[]): number[][];
    /**
     * Constructs a block diagonal matrix from the given blocks.
     * @param {Object} options The options object.
     * @param {number[][][]} options.blocks The blocks to form the diagonal matrix.
     * @param {number[]} [options.order=null] Optional order for arranging the blocks.
     * @returns {number[][]} The block diagonal matrix.
     */
    export function diagBlock(options: {blocks: number[][][]; order: number[]}): number[][];
    /**
     * Calculates the Euclidean distance between two vectors.
     * @param {number[]} array1 The first vector.
     * @param {number[]} array2 The second vector.
     * @returns {number} The Euclidean distance between the two vectors.
     * @throws {Error} If the arrays have different lengths or if either array is not an array.
     */
    export function euclideanDist(vector1: number[], vector2: number[]): number;
	/**
     * Calculates the Frobenius norm of the given matrices or vectors.
     * [Frobenius norm](https://en.wikipedia.org/wiki/Matrix_norm#Frobenius_norm)
     * @param {number[][]} [array1] The first matrix or vector (optional).
     * @param {number[][]} [array2] The second matrix or vector (optional).
     * @returns {number} The Frobenius norm of the matrices or vectors.
     */
	export function frobenius(a: number[][], b: number[][]): number;
    /**
    * @callback elemWiseCb
    * @param {Array.<Number>} arr
    * @param {Number} rowId
    * @param {Number} colId
    */
    /**
    * Run a function on cell per cell for each Matrixes
    * @param {<Array.<Array.<Array.<Number>>>} arrMatrixes list of matrixes
    * @param {elemWiseCb} fn
    * @returns {Array.<Array.<Number>>} resulting matrix
    * @example
    // this will do m1 + m2 + m3 + m4 on matrixes
    elemWise([m1, m2, m3, m4], args2 => {
    	return args2.reduce((a, b) => a + b, 0);
    });
    */
	export function elemWise(matrices: number[][][], callback: (list: number[], rowId: number, colId: number) => number): number[][];
	/**
	 * build an identity square matrix
	 * @param stateSize matrix size
	 */
	export function identity(stateSize: number): number[][];
	/**
	 * return a inversed copy of the provided matrix
	 * @param matrix 
	 */
	export function invert(matrix: number[][]): number[][];
	/**
     * Multiply 2 matrixes together
     * @param  m1 matrix 1
     * @param  m2 matrix 2
     * @returns result matrix
     */
	export function matMul(a: number[][], b: number[][]): number[][];
	/**
     * Generates a new matrix of a specified output size by permuting the rows and columns 
     * of the input matrix according to the given row and column indexes. 
     * The function fills positions in the output matrix with values from the input matrix 
     * based on these indexes, placing 0 where indexes do not match.
     * 
     * @param {Object} options - The options object containing all parameters.
     * @param {Array<Array<number>>} options.matrix - The input matrix from which to permute values.
     * @param {Array<number>} options.outputSize - An array of two integers specifying the dimensions [nRow, nCol] of the output matrix.
     * @param {Array<number>} options.rowIndexes - An array of integers specifying the row indexes in the input matrix to be considered for permutation.
     * @param {Array<number>} options.colIndexes - An array of integers specifying the column indexes in the input matrix to be considered for permutation.
     * 
     * @returns {Array<Array<number>>} A new matrix of dimensions specified by `outputSize`. This matrix contains the permuted values from the input matrix at the specified row and column indexes, with all other positions filled with 0.
     * 
     * @throws {TypeError} Throws a TypeError if either `rowIndexes` or `colIndexes` is not an array.
     */
	export function matPermutation(options: {matrix: number[][]; outputSize: number[]; colIndexes: number[]; rowIndexes: number[]}): number[][];
	/**
     * This function returns the padded matrix with zeros with respect to a given
     * target columns number
     * @param {Array.<Array.<Number>>} matrix the matrix we need to pad
     * @param {Number} columns in our case, the dynamic dimension
     * @returns {Array.<Array.<Number>>} padded matrix
     */
	export function padWithZeroCols(matrix: number[][], options: {columns: number}): number[][];
	/**
	 * Applies an element-wise subtraction operation on the given arrays of matrices.
	 */
	export function subtract(a: number[][], b: number[][]): number[][];
	/**
     * Extracts a sub-square matrix from the provided matrix based on the given indexes.
     * @param {number[][]} mat The matrix from which to extract the sub-square matrix.
     * @param {number[]} indexes The indexes to select rows and columns from the matrix.
     * @returns {number[][]} The sub-square matrix extracted from the original matrix.
     */
	export function subSquareMatrix(matrix: number[][], indices: number[]): number[][];
	export function sum(matrix: number[][]): number;
	/**
     * Sums all the elements of the given vector.
     * @param {number[]} vector The vector whose elements are to be summed.
     * @returns {number} The sum of all elements in the vector.
     */
	export function sumVector(matrix: number[]): number;
	export function trace(matrix: number[][]): number;
    /**
     * Transposes the given 2D array.
     * @param {Array<Array<any>>} array The 2D array to transpose.
     * @returns {Array<Array<any>>} The transposed 2D array.
     */
    export function transpose(matrix: number[][]): number[][];
    /**
     * Generates a 2D array filled with zeros with the specified number of rows and columns.
     * @param {number} rows The number of rows for the 2D array.
     * @param {number} cols The number of columns for the 2D array.
     * @returns {number[][]} A 2D array filled with zeros.
     */
    export function zeros(n: number): number[][];
    /**
     * Calculates the Euclidean norm of the given vector.
     * @param {number[]} vector The vector for which to calculate the Euclidean norm.
     * @returns {number} The Euclidean norm of the vector.
     */
	export function norm(vector: number[]): number;
	/**
     * Maps a function over each element of the given matrix.
     * @param {Array<Array<any>>} a The matrix to map over.
     * @param {function(any, number, number): any} fn The mapping function to apply.
     * @returns {Array<Array<any>>} The matrix with the function applied to each element.
     */
	export function mapMatrix(matrix: number[][], callback: (value: number, rowId: number, colId: number) => void): void;
	/**
     * Calculates the dot product of two vectors.
     * @param {number[]} vector1 The first vector.
     * @param {number[]} vector2 The second vector.
     * @returns {number} The dot product of the two vectors.
     * @throws {Error} If the lengths of the vectors do not match.
     */
	export function dotProduct(a: number[], b: number[]): number;
}
