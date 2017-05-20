const path = require('path');
const SnapshotState = require('jest-snapshot').SnapshotState;
const diff = require('jest-diff');
const {serializeWithoutExtraLineBreaks, trimExtraLineBreaks} = require('./serialize');

/**
 * Takes an object which contains some options, and returns a new object with every option in it. Default options are
 * used wherever an option is missing.
 *
 * Alternatively, returns an object with all of the default options in case undefined is passed.
 */
const fillInMissingOptions = (function fillInMissingOptionsUnbound(defaults, input) {
	if (undefined === input) {
		return defaults;
	} else /* if (undefined !== input) */ {
		return Object.assign(
			{},
			defaults,
			input
		);
	}
}).bind(
	undefined,
	{
		snapshotPath: path.join('bancheck', 'snapshots.snap')
	}
);

/**
 * The options that are passed to diff (see the require call above, and the test function below).
 */
const diffOptions = {
	aAnnotation: 'Expected',
	bAnnotation: 'Actual'
};

function run(tests, updateSnapshot, options) {
	if ('object' != typeof tests) {
		throw new Error('The passed tests must be an object');
	}
	if (undefined !== options && 'object' != typeof options) {
		throw new Error('The passed options must be an object or left undefined');
	}
	// Fill in the options which were not provided with the default values.
	options = fillInMissingOptions(options);
	// Create the state.
	const state = new SnapshotState(
		undefined,
		{
			snapshotPath: options.snapshotPath,
			updateSnapshot
		}
	);
	// Run the tests.
	const results = {};
	Object.keys(tests).forEach(testName => {
		results[testName] = state.match(testName, tests[testName]);
	});
	return {
		state,
		results
	};
}

/**
 * Runs the passed tests with confidence that the current actual values are correct. The tests (first argument) should
 * be an object where the key is an identifier of the test and the value is the actual value of the test.
 *
 * The actual values of the tests are stored as the expected values.
 *
 * Returns an object with a "passes" property.
 */
function expect(tests, options) {
	// Run the tests.
	const {state} = run(tests, 'all', options);
	// Stage any data that was present in the snapshot but was not matched against for removal.
	state.removeUncheckedKeys();
	// Save the state to permanent storage.
	state.save();
	// Compose the result. As every test "passes" by definition, this is uncomplicated.
	const passes = {};
	Object.keys(tests).forEach(testName => {
		passes[testName] = serializeWithoutExtraLineBreaks(tests[testName]);
	});
	return {
		passes
	};
}

/**
 * Runs the passed tests. The tests (first argument) should be an object where the key is an identifier of the test and
 * the value is the actual value of the test.
 *
 * If a test with the same identifier was present the last time this function or the expect function was run, the
 * current actual value for the test is compared to the expected value that was stored.
 *
 * If there is a new test, the current actual value for the test is stored as the expected value.
 *
 * Returns an object with a "passes" property and a "fails" property.
 */
function test(tests, options) {
	// Run the tests.
	const {results, state} = run(tests, 'new', options);
	// Save the state to permanent storage, in case new tests were run.
	state.save();
	// Compose the result.
	const passes = {};
	const fails = {};
	Object.keys(results).forEach(testName => {
		const result = results[testName];
		if (result.pass) {
			passes[testName] = serializeWithoutExtraLineBreaks(tests[testName]);
		} else /* if (false == result.pass) */ {
			fails[testName] = {
				expected: trimExtraLineBreaks(result.expected),
				actual: trimExtraLineBreaks(result.actual),
				diff: diff(result.expected, result.actual, diffOptions)
			};
		}
	});
	return {
		passes,
		fails
	};
}

module.exports = {
	expect,
	test
};
