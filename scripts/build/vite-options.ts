import { readFile } from 'fs-extra';
import { ConfigEnv } from 'vite';
import { gjSectionConfigs, gjSectionNames } from './section-config';

const path = require('path') as typeof import('path');

type UnwrapPromise<T> = T extends Promise<infer U> ? U : never;

export type ParsedOptions = UnwrapPromise<ReturnType<typeof parseOptionsFromEnv>>;

export type Options = UnwrapPromise<ReturnType<typeof inferAndValidateFromParsedOptions>>;

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

	function parseYesNoOption(arg: string | undefined, argNameHuman: string) {
		const opt = parseOption(
			arg,
			argNameHuman,
			['y', 'n', 'yes', 'no', 'true', 'false', 'on', 'off', '1', '0', null] as const,
			null
		);

		return opt === null ? null : ['y', 'yes', 'true', 'on', '1'].includes(opt);
	}

	// Which section to build.
	const section = parseOption(process.env['GJ_SECTION'], 'Section', gjSectionNames, 'app');

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
		'development'
	);

	const emptyOutDir =
		parseYesNoOption(
			process.env['GJ_EMPTY_OUTDIR'],
			'Empty output directory before building'
		) ?? true;

	const withUpdater = parseYesNoOption(
		process.env['GJ_WITH_UPDATER'],
		'Enable self updater / connectivity to parent Joltron process'
	);

	return {
		section,
		platform,
		environment,
		buildType,
		emptyOutDir,
		withUpdater,
	};
}

export async function inferAndValidateFromParsedOptions(
	opts: ParsedOptions,
	viteConfigEnv: ConfigEnv
) {
	// The version we report to the backend.
	// Defaults to the version specified in package.json.
	// Overriding this makes sense only in development, and is usually
	// done when we need to test backwards compatibility.
	const packageJson = JSON.parse(
		await readFile(path.resolve(__dirname, '..', '..', 'package.json'), 'utf-8')
	);
	const version: string = process.env['GJ_VERSION'] ?? packageJson.version;
	const nwjsVersion: string = process.env['GJ_NWJS_VERSION'] ?? packageJson.nwjsVersion ?? '';
	if (!nwjsVersion) {
		throw new Error(`Could not infer nwjs version`);
	}

	// Self updater only makes sense when doing a build, but can be enabled or disabled explicitly.
	const withUpdater = opts.withUpdater ?? viteConfigEnv.command === 'build';

	// Merge current section config with defaults.
	const currentSectionConfig = gjSectionConfigs[opts.section];

	// Don't build a section that is not supported for the configured platform.
	if (!getSectionNamesForPlatform(opts.platform).includes(opts.section)) {
		throw new Error(
			`Not supported building section '${opts.section}' for platform '${opts.platform}'`
		);
	}

	return {
		...opts,
		version,
		nwjsVersion,
		withUpdater,
		currentSectionConfig,
	};
}

export async function parseAndInferOptionsFromEnv(viteConfigEnv: ConfigEnv) {
	const parsedOpts = await parseOptionsFromEnv();
	return await inferAndValidateFromParsedOptions(parsedOpts, viteConfigEnv);
}

export function getSectionNamesForPlatform(platform: Options['platform']) {
	let fieldToCheck: 'desktopApp' | 'ssr' | 'mobileApp';
	switch (platform) {
		case 'desktop':
			fieldToCheck = 'desktopApp';
			break;

		case 'ssr':
			fieldToCheck = 'ssr';
			break;

		case 'mobile':
			fieldToCheck = 'mobileApp';
			break;

		default:
			// Return copy of section names to avoid accidental mutations.
			return [...gjSectionNames];
	}

	return gjSectionNames.filter(sectionName => gjSectionConfigs[sectionName][fieldToCheck]);
}
