import { readFile } from 'fs-extra';
import path from 'path';

export type ParsedOptions = ReturnType<typeof parseOptionsFromEnv> extends Promise<infer T>
	? T
	: never;

export type InferredOptions = {};

export type Options = ParsedOptions & InferredOptions;

export async function parseOptionsFromEnv() {
	function isExpectedValue<T>(
		value: any,
		expectedValues: readonly T[]
	): value is typeof expectedValues[number] {
		return expectedValues.includes(value);
	}

	function parseOption<T>(
		arg: string | undefined,
		argNameHuman: string,
		validValues: readonly T[],
		defaultValue: typeof validValues[number]
	): typeof validValues[number] {
		if (arg === undefined) {
			return defaultValue;
		}

		const arg2 = arg.toLowerCase().trim();
		if (arg2 === '') {
			return defaultValue;
		}

		if (!isExpectedValue(arg2, validValues)) {
			throw new Error(
				`${argNameHuman} must be one of '${validValues.join("', '")}'. Got: '${arg}'`
			);
		}

		return arg as any;
	}

	// Which section to build.
	const section = parseOption(
		process.env['GJ_SECTION'],
		'Section',
		[
			'app',
			'auth',
			'checkout',
			'claim',
			'client',
			'editor',
			'gameserver',
			'widget-package',
			'z',
		] as const,
		'app'
	);

	// Which platform to build for.
	const platform = parseOption(
		process.env['GJ_PLATFORM'],
		'Target platform',
		['web', 'desktop', 'mobile', 'ssr'] as const,
		'web'
	);

	// Which environment to target.
	// Controls where to send API requests and where some urls point to.
	const environment = parseOption(
		process.env['GJ_ENVIRONMENT'],
		'Target environment',
		['production', 'development'] as const,
		'production'
	);

	// Some features behave differently between development
	// and production (for example we do not create shortcuts for the desktop app in development).
	const buildType = parseOption(
		process.env['GJ_BUILD_TYPE'],
		'Build type',
		['production', 'development'] as const,
		'production'
	);

	// The version we report to the backend.
	// Defaults to the version specified in package.json.
	// Overriding this makes sense only in development, and is usually
	// done when we need to test backwards compatibility.
	const packageJson = JSON.parse(
		await readFile(path.resolve(__dirname, '..', '..', 'package.json'), 'utf-8')
	);
	const version: string = process.env['GJ_VERSION'] ?? packageJson.version;

	// TODO: infer this from other properties.
	// I'm not sure if we want to keep the same logic we did before,
	// it depends on how packaging up the client works with vite once I get that working.
	const withUpdater = false;

	return {
		section,
		platform,
		environment,
		buildType,
		version,
		withUpdater,
	};
}
