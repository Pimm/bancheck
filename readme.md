## bancheck

Conventional testing frameworks depend on you for the _actual_ and the _expected_. Put differently: you have to write
test code and predict the outcome. `bancheck` expects your code to work, and because it does it only depends on you for
the _actual_.

That's your responsibilities cut in half right there. Writing tests becomes easier, as does maintaining tests.

### An example

Say you have a function `splitName` which takes a human-inputted name and splits it into its different parts.

These are two tests:
```javascript
const {test, expect} = require('bancheck');

test({
	pimm: splitName('Pimm Hogeling'),
	vincent: splitName('Vincent van Gogh')
})
```

This is the output:
```javascript
{
	"passes": {
		"pimm": "Object {\
			\"familyName\": \"Hogeling\",\
			\"givenName\": \"Pimm\",\
		}",
		"vincent": "Object {\
			\"familyName\": \"van Gogh\",\
			\"givenName\": \"Vincent\",\
		}"
	},
	"fails": {}
}
```

Just double-check those passes and you are set.

#### Updating the tests

Now say later you come to your senses and realise the "van" in "Vincent van Gogh" is actually not part of his family
name, but rather a [tussenvoegsel](https://en.wikipedia.org/wiki/Tussenvoegsel).

Simply change `splitName` and re-run the test. This is the output:
```javascript
{
	"passes": {
		"pimm": "Object {\
			\"familyName\": \"Hogeling\",\
			\"givenName\": \"Pimm\",\
		}"
	},
	"fails": {
		"vincent": {
			"expected": "Object {\
				\"familyName\": \"van Gogh\",\
				\"givenName\": \"Vincent\",\
			}",
			"actual": "Object {\
				\"familyName\": \"Gogh\",\
				\"givenName\": \"Vincent\",\
				\"tussenvoegsels\": \"van\",\
			}",
			"diff": …
		}
	}
}
```

One test fails, but not because your function is broken. The test is outdated. Update it by calling `expect` instead of
`test`:
```javascript
const {test, expect} = require('bancheck');

expect({
	pimm: splitName('Pimm Hogeling'),
	vincent: splitName('Vincent van Gogh')
})
```
This is the output:
```javascript
{
	"passes": {
		"pimm": "Object {\
			\"familyName\": \"Hogeling\",\
			\"givenName\": \"Pimm\",\
		}",
		"vincent": "Object {\
			\"familyName\": \"Gogh\",\
			\"givenName\": \"Vincent\",\
			\"tussenvoegsel\": \"van\",\
		}"
	},
	"fails": {}
}
```

The tests have been updated, and you can call `test` again from this point on.

### Usage

`bancheck` exports a `test` and an `expect` function. You can include test runs in your build script. If you are looking
for a ready-to-go command-line interface, check out [jest-cli](https://www.npmjs.com/package/jest-cli).

`bancheck` saves the _expected_ data in a snapshot file located at `bancheck/snapshots.snap`. You probably want to
distribute that file along with your source code.
