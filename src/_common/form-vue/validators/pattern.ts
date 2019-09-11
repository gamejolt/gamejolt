// Since they get set as ng-pattern attributes, we have to double backslash.
const Patterns: { [k: string]: RegExp } = {
	// Alphanumeric, hyphens.
	urlPath: /^[\w\-]+$/,

	domain: /^((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/,

	// Alphanumeric, underscores.
	hashtag: /^[\w\_]+$/,

	// Alphanumeric, underscores, hyphens.
	username: /^[\w\-]+$/,

	// GA Tracking ID
	gaTrackingId: /^UA\-[0-9]+\-[0-9]+$/,

	// Semver version strings
	// https://github.com/sindresorhus/semver-regex/blob/master/index.js
	semver: /^v?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?$/i,
};

export function FormValidatorPattern(value: string, args: [string | RegExp]) {
	const arg = args[0];
	let pattern: RegExp;
	if (arg instanceof RegExp) {
		pattern = arg;
	} else {
		pattern = Patterns[arg];
	}

	if (!pattern) {
		throw new Error(`Invalid pattern passed in.`);
	}

	return pattern.test(value);
}
