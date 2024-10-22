# Lernen / Merken

```js
// Example of how semantic-release works with commit messages:

// These commits will trigger a new release:
// feat: add new feature (triggers minor version bump)
// fix: resolve bug (triggers patch version bump)
// feat!: breaking change (triggers major version bump)
// perf: improve performance (triggers patch version bump)

// These commits won't trigger a release:
// docs: update readme
// chore: update dependencies
// style: format code
// test: add new tests
// refactor: clean up code
```
