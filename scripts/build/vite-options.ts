import { readFile } from 'fs-extra';
import { gjSectionConfigs, gjSectionNames } from './section-config';

const path = require('path') as typeof import('path');

type UnwrapPromise<T> = T extends Promise<infer U> ? U : never;
type ParsedOptions = ReturnType<typeof parseOptionsFromCommandlineArgs>;

type OptionPrimitive = string | number | boolean;
type MinimistArgument = OptionPrimitive | OptionPrimitive[] | undefined;
type MinimistParsedArguments = {
	_: string[];
	[key: string]: MinimistArgument;
};

export type Options = UnwrapPromise<ReturnType<typeof parseAndInferOptionsFromCommandline>>;

export async function parseAndInferOptionsFromCommandline(args: MinimistParsedArguments) {
	const parsedOpts = parseOptionsFromCommandlineArgs(args);
	return await inferAndValidateFromParsedOptions(parsedOpts);
}

function isExpectedValue<T extends string | null>(
	value: any,
	expectedValues: readonly T[]
): value is typeof expectedValues[number] {
	return expectedValues.includes(value);
}

function parseOption<T extends string | null>(
	arg: MinimistArgument,
	argNameHuman: string,
	validValues: readonly T[],
	defaultValue: typeof validValues[number]
): typeof validValues[number] {
	if (arg === undefined) {
		return defaultValue;
	}

	// If array passed take the last element. This basically chooses the value
	// of the last time an option was specified. Also coerce the argument to a
	// string. This makes matching against the expected values simpler.
	let arg2 = Array.isArray(arg) ? arg[arg.length - 1] : arg;
	switch (typeof arg2) {
		case 'string':
			arg2 = (arg2 as string).toLowerCase().trim();
			break;

		case 'number':
			arg2 = (arg2 as number).toString();
			break;

		case 'boolean':
			arg2 = arg2 ? 'true' : 'false';
			break;

		default:
			throw new Error(
				`Expected type of argument to be string, number or boolean, got: ${typeof arg2} for argument ${argNameHuman}`
			);
	}

	if (arg2 === '') {
		return defaultValue;
	}

	if (!isExpectedValue(arg2, validValues)) {
		throw new Error(
			`${argNameHuman} must be one of '${validValues.join("', '")}'. Got: '${arg2}'`
		);
	}

	return arg2 as any;
}

function parseYesNoOption(arg: MinimistArgument, argNameHuman: string) {
	const opt = parseOption(
		arg,
		argNameHuman,
		['y', 'n', 'yes', 'no', 'true', 'false', 'on', 'off', '1', '0', null] as const,
		null
	);

	return opt === null ? null : ['y', 'yes', 'true', 'on', '1'].includes(opt);
}

/**
 * This function parses the output of minimist, checks for invalid options and
 * returns an object of sanitized options that control how vite runs / builds
 * the frontend.
 *
 * Valid command line arguments:
 * ```
 *   --platform <platform>
 *   --envrionment <environment>
 *   --staging, --no-staging
 *   --build-type <type>
 *   --empty-outdir, --no-empty-outdir
 *   --with-updater, --no-with-updater
 *   --with-ffmpeg, --no-with-ffmpeg
 *   --gj-version <version>
 *   --nwjs-version <version>
 *
 * ```
 *
 * Overriding previous command lines that control the same setting is possible.
 * for example: `--platform web --platform desktop` will be result in `platform`
 * being parsed as `desktop`.
 *
 * Read the comments in the function for more info on each parameter.
 */
function parseOptionsFromCommandlineArgs(args: MinimistParsedArguments) {
	// Which section to build.
	const section = parseOption(args.section, 'Section', gjSectionNames, 'app');

	// Which platform to build for.
	const platform = parseOption(
		args.platform,
		'Target platform',
		['web', 'desktop', 'mobile', 'ssr'] as const,
		'web'
	);

	// Which environment to target.
	// Controls where to send API requests and where some urls point to.
	const environment = parseOption(
		args.environment,
		'Target environment',
		['production', 'development'] as const,
		'production'
	);

	// Whether to treat the build as staging. In production a staging build is
	// commonly used to enable debugging and be more verbose with its output. In
	// development a staging build is used to test features that would normally
	// only run in production (e.g. self updating the desktop app).
	const isStaging = parseYesNoOption(args.staging, 'Staging build') ?? false;

	// Which build to do.
	// Depending on which platform we're building for this may support different options.
	const buildType = (() => {
		const buildTypeArg = args['build-type'];

		switch (platform) {
			case 'web':
			case 'mobile':
				return parseOption(
					buildTypeArg,
					'Build type',
					[
						// Builds to filesystem for the purpose of being
						// deployed to our web servers.
						//
						// 'build' is similar to 'serve-build' only when
						// targetting the production environment it expects the
						// static assets to be served from the prod cdn.
						'build',
						// Builds to filesystem for the purpose of being served
						// locally as a dev build.
						'serve-build',
						// Builds for usage with a devserver. This build type
						// enables hot module reloading.
						'serve-hmr',
					] as const,
					'serve-hmr'
				);

			case 'desktop':
				return parseOption(
					buildTypeArg,
					'Build type',
					[
						// Builds to filesystem for the purpose of being
						// distributed.
						//
						// 'build' is similar to 'serve-build' only it expects to
						// be further restructured as an actual nwjs
						// application. this means for example that some paths
						// need to change, for instance the location of the
						// source files relative to where nwjs executable runs
						// from.
						'build',
						// Builds to filesystem for the purpose of being served
						// locally as a dev build.
						'serve-build',
						// Builds for usage with a devserver. This build type
						// enables hot module reloading.
						'serve-hmr',
					] as const,
					'serve-hmr'
				);

			case 'ssr':
				return parseOption(
					buildTypeArg,
					'Build type',
					[
						// Builds to filesystem for the purpose of being
						// distributed.
						'build',
					] as const,
					'build'
				);

			default:
				throw new Error(`Unknown platform '${platform}'`);
		}
	})();

	const emptyOutDir =
		parseYesNoOption(args['empty-outdir'], 'Empty output directory before building') ?? true;

	const withUpdater = parseYesNoOption(
		args['with-updater'],
		'Enable self updater / connectivity to parent Joltron process'
	);

	const withFfmpeg = parseYesNoOption(args['with-ffmpeg'], 'Acquire ffmpeg binaries') ?? true;

	const version = args['gj-version'];
	const nwjsVersion = args['nwjs-version'];

	return {
		section,
		platform,
		environment,
		isStaging,
		buildType,
		emptyOutDir,
		withUpdater,
		withFfmpeg,
		version,
		nwjsVersion,
	};
}

async function inferAndValidateFromParsedOptions(opts: ParsedOptions) {
	// The version we report to the backend.
	// Defaults to the version specified in package.json.
	// Overriding this makes sense only in development, and is usually
	// done when we need to test backwards compatibility.
	const packageJson = JSON.parse(
		await readFile(path.resolve(__dirname, '..', '..', 'package.json'), 'utf-8')
	);
	const version: string = (opts.version ?? false) || packageJson.version;
	const nwjsVersion: string = (opts.nwjsVersion ?? false) || packageJson.nwjsVersion || '';
	if (!nwjsVersion) {
		throw new Error(`Could not infer nwjs version`);
	}

	// Self updater only makes sense when doing an actual build, but can be enabled or disabled explicitly.
	const withUpdater =
		opts.withUpdater ?? (opts.platform === 'desktop' && opts.buildType === 'build');

	// Ffmpeg binaries are usually only needed when serving the desktop app locally.
	const withFfmpeg =
		opts.withFfmpeg ??
		(opts.platform === 'desktop' &&
			(opts.buildType === 'serve-hmr' || opts.buildType === 'serve-build'));

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
		withFfmpeg,
		currentSectionConfig,
	};
}

function getSectionNamesForPlatform(platform: Options['platform']) {
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
