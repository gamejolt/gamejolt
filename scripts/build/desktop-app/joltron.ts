import { isWindows, packageJson, runShell, shellEscape } from '../utils';
import * as fs from 'fs-extra';

const path = require('path') as typeof import('path');

// The loader variant version looks like `${version}.loader`, but git's release version is simply `${version}` so we gotta transform it.
export const joltronVersion = (packageJson.joltronVersion as string).replace(/\.loader$/, '');

// Path to the where we clone and build joltron.
const joltronRepoDir =
	'GOPATH' in process.env
		? path.resolve(process.env.GOPATH, 'src', 'github.com', 'gamejolt', 'joltron')
		: null;

const joltronExecutableBasename = isWindows() ? 'joltron.exe' : 'joltron';
const joltronExecutableFilepath =
	typeof joltronRepoDir === 'string'
		? path.resolve(joltronRepoDir, joltronExecutableBasename)
		: null;

/**
 * Ensures the joltron repo is cloned locally.
 * This function does not check out the specific joltron version commit on existing repos.
 * This allows us to make changes to joltron and test them out in dev.
 */
export async function ensureJoltronCloned() {
	console.log('Getting joltron');
	if (joltronRepoDir === null) {
		throw new Error('GOPATH is not set, cannot build joltron');
	}

	console.log('Ensuring joltron repo dir: ' + joltronRepoDir);
	await fs.mkdirp(joltronRepoDir);

	const gitStatus = 'git -C ' + shellEscape(joltronRepoDir) + ' status';
	const gitClone =
		'git clone --branch ' +
		joltronVersion +
		' git@github.com:gamejolt/joltron.git ' +
		shellEscape(joltronRepoDir);

	// Do status first, if it fails it means the repo doesn't exist, so try cloning.
	await runShell(`${gitStatus} || ${gitClone}`);
}

export async function buildJoltron() {
	console.log('Building Joltron');
	if (joltronRepoDir === null) {
		throw new Error('GOPATH is not set, cannot build joltron');
	}

	if (isWindows()) {
		const versionStuff = joltronVersion.match(/^v?(\d+)\.(\d+)\.(\d+)/);
		if (!versionStuff) {
			throw new Error('Joltron version is invalid');
		}
		const joltronVersionArray = [
			parseInt(versionStuff[1]),
			parseInt(versionStuff[2]),
			parseInt(versionStuff[3]),
		];

		await fs.writeFile(
			path.resolve(joltronRepoDir, 'versioninfo.json'),
			JSON.stringify({
				FixedFileInfo: {
					FileVersion: {
						Major: joltronVersionArray[0],
						Minor: joltronVersionArray[1],
						Patch: joltronVersionArray[2],
						Build: 0,
					},
					ProductVersion: {
						Major: joltronVersionArray[0],
						Minor: joltronVersionArray[1],
						Patch: joltronVersionArray[2],
						Build: 0,
					},
					FileFlagsMask: '3f',
					FileFlags: '00',
					FileOS: '040004',
					FileType: '01',
					FileSubType: '00',
				},
				StringFileInfo: {
					Comments: '',
					CompanyName: 'Game Jolt Inc.',
					FileDescription: 'Game Jolt Client',
					FileVersion: joltronVersionArray.join('.'),
					InternalName: 'GameJoltClient',
					LegalCopyright: '',
					LegalTrademarks: '',
					OriginalFilename: 'GameJoltClient',
					PrivateBuild: '',
					ProductName: 'Game Jolt Client',
					ProductVersion: 'v' + joltronVersionArray.join('.') + '.0',
					SpecialBuild: '',
				},
				VarFileInfo: {
					Translation: {
						LangID: '0409',
						CharsetID: '04B0',
					},
				},
				IconPath: path.resolve(__dirname, 'icons/winico.ico'),
				ManifestPath: '',
			}),
			{ encoding: 'utf8' }
		);
	}

	const isDevelopment = process.env.GJ_ENVIRONMENT === 'development';

	const commands: { command: string; args: string[] }[] = [];
	if (isWindows()) {
		commands.push(
			{
				command: path.join('build', 'deps.bat'),
				args: [],
			},
			{
				command: path.join('build', 'build.bat'),
				args: [`-l${isDevelopment ? 'd' : ''}`],
			}
		);
	} else {
		commands.push(
			{
				command: path.join('build', 'deps.sh'),
				args: [],
			},
			{
				command: path.join('build', 'build.sh'),
				args: [`-l${isDevelopment ? 'd' : ''}`],
			}
		);
	}

	for (const { command, args } of commands) {
		await runShell(command, { args, cwd: joltronRepoDir });
	}
}

// /**
//  * Structure the build folder with joltron, as if it was installed by it.
//  * This is what we want our installer to unpack.
//  */
// async function setupJoltron() {
// 	console.log('Setting up Joltron');

// 	// If we want to skip gjpush to test the packaging we need to provide
// 	// the build ID ourselves because we won't be hitting service-api to get
// 	// it.
// 	let buildId = 739828;

// 	// We need to know our build ID for the package zip we just uploaded,
// 	// because the build id is part of the game UID ("packageId-buildId)"
// 	// which we need for joltron's manifest file. So we can use the service
// 	// API to query it!
// 	if (config.pushBuild) {
// 		// First step is getting the release ID matching the version we just
// 		// uploaded.
// 		const releasePayload = await sendApiRequest(
// 			'/releases/by-version/' + gjGamePackageId + '/' + packageJson.version
// 		);

// 		// Then find the builds for that version.
// 		const buildPayload = await sendApiRequest(
// 			'/releases/builds/' +
// 				releasePayload.release.id +
// 				'?game_id=' +
// 				gjGameId +
// 				'&package_id=' +
// 				gjGamePackageId
// 		);

// 		// The build matching the filename we just uploaded is the build ID
// 		// we're after.
// 		const build = buildPayload.builds.data.find(i => {
// 			return i && i.file && i.file.filename === config.platformArch + '-package.tar.gz';
// 		});
// 		if (!build) {
// 			throw new Error('Could not get build');
// 		}

// 		buildId = build.id;
// 	}

// 	await fs.mkdirp(path.resolve(config.clientBuildDir, 'dist'));

// 	// This is joltron's data directory for this client build
// 	const buildDir = path.resolve(
// 		config.clientBuildDir,
// 		'dist',
// 		'data-' + gjGamePackageId + '-' + buildId
// 	);

// 	// Rename our build folder (which is the contents of our package zip)
// 	await fs.rename(path.resolve(config.clientBuildDir, 'build'), buildDir);

// 	// Next up we want to fetch the same joltron version as the client build
// 	// is using, even if there is a newer version of joltron released. This
// 	// ensures the client and joltron can communicate without issues.

// 	// Joltron should be placed next to the client build's data folder. On
// 	// windows joltron will be linked to and executed directly, so call it
// 	// GameJoltClient.exe to avoid confusion. On linux we call the
// 	// executable game-jolt-client, so we can rename joltron to that. On mac
// 	// we can also rename it to game-jolt-client for consistency. the
// 	// executable is contained in the app directory anyways.
// 	const joltronDest = path.resolve(
// 		buildDir,
// 		'..',
// 		isWindows() ? 'GameJoltClient.exe' : 'game-jolt-client'
// 	);

// 	// Some more info is required for joltron's manifest. The correct host
// 	// is needed for the platformURL - this tells joltron where to look for
// 	// updates.
// 	const gjHost = config.developmentEnv
// 		? 'http://development.gamejolt.com'
// 		: 'https://gamejolt.com';

// 	// The executable tells joltron what is the executable file within this
// 	// client build's data folder.
// 	let executable = '';
// 	if (isWindows()) {
// 		executable = 'GameJoltClient.exe';
// 	} else if (config.platform === 'osx') {
// 		executable = 'Game Jolt Client.app/Contents/MacOS/Game Jolt Client';
// 	} else {
// 		executable = 'game-jolt-client';
// 	}

// 	// Joltron expects the platform field to be either windows/mac/linux.
// 	let platform = '';
// 	if (isWindows()) {
// 		platform = 'windows';
// 	} else if (config.platform === 'osx') {
// 		platform = 'mac';
// 	} else {
// 		platform = 'linux';
// 	}

// 	// Figure out the archive file list.
// 	const archiveFiles = (await readdirp.promise(buildDir))
// 		.map(i => './' + i.path.replace(/\\/g, '/'))
// 		.sort();

// 	await fs.copy(joltronSrc, joltronDest);

// 	// Make sure it is executable.
// 	await fs.chmod(joltronDest, '0755');

// 	// Finally create joltron's manifest file
// 	await fs.writeFile(
// 		path.resolve(buildDir, '..', '.manifest'),
// 		JSON.stringify({
// 			version: 2,
// 			autoRun: true,
// 			gameInfo: {
// 				dir: path.basename(buildDir),
// 				uid: gjGamePackageId + '-' + buildId,
// 				archiveFiles: archiveFiles,
// 				platformUrl: gjHost + '/x/updater/check-for-updates',
// 				declaredImplementations: {
// 					presence: true,
// 					badUpdateRecovery: true,
// 				},
// 			},
// 			launchOptions: { executable: executable },
// 			os: platform,
// 			arch: config.arch + '',
// 			isFirstInstall: false,
// 		}),
// 		'utf8'
// 	);
// }
