// This file is designed to be a drop-in replacement of part of the "utils" module from jest-snapshot. Specifically, the
// serialize function from that module. Unfortunately, that package does not export the serialize function. The original
// file can be found here:
//   https://github.com/facebook/jest/blob/master/packages/jest-snapshot/src/utils.js
// The original file is licensed under a BSD-style license. See the original file for more information.
const prettyFormat = require('pretty-format');

const addExtraLineBreaks = (function addExtraLineBreaksUnbound(array, input) {
	if (input.includes('\n')) {
		array[1] = input;
		const result = array.join('\n');
		delete array[1];
		return result;
	} else /* if (false == input.includes('\n')) */ {
		return input;
	}
}).bind(undefined, [,,,]);

// This function is not present in the original, but it is the opposite of addExtraLineBreaks.
function trimExtraLineBreaks(input) {
	if ('\n' == input.charAt(0) && '\n' == input.charAt(input.length - 1)) {
		return input.substr(1, input.length - 2);
	} else /* if ('\n' == input.charAt(0) && '\n' == input.charAt(input.length - 1)) */ {
		return input;
	}
}

// This method is called "normalizeNewlines" in the original.
function normalizeLineBreaks(input) {
	return input.replace(/\r\n|\r/g, '\n');
}

/**
 * The options that are passed to prettyFormat (see the require call above, and the serialize functions below).
 */
const prettyFormatOptions = {
	escapeRegex: true,
	// (Is caching the serializers here OK?)
	plugins: require('jest-snapshot').getSerializers(),
	printFunctionName: false
};

function serialize(input) {
	return addExtraLineBreaks(
		normalizeLineBreaks(
			prettyFormat(input, prettyFormatOptions)
		)
	);
}

function serializeWithoutExtraLineBreaks(input) {
	return normalizeLineBreaks(
		prettyFormat(input, prettyFormatOptions)
	);
}

module.exports = {
	addExtraLineBreaks,
	trimExtraLineBreaks,
	normalizeLineBreaks,
	serialize,
	serializeWithoutExtraLineBreaks
};
