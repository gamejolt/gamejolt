import {
	createTarGz,
	isLinux,
	isMac,
	isWindows,
	packageJson,
	runShell,
	shellEscape,
} from '../utils';
import * as fs from 'fs-extra';
import * as readdirp from 'readdirp';
import { buildInnoSetup } from './inno-setup';
import { Options } from '../vite-options';

const path = require('path') as typeof import('path');
const os = require('os') as typeof import('os');

// The loader variant version looks like `${version}.loader`, but git's release version is simply `${version}` so we gotta transform it.
export const joltronVersion = (packageJson.joltronVersion as string).replace(/\.loader$/, '');

// Path to the where we clone and build joltron.
const joltronRepoDir =
	'GOPATH' in process.env
		? path.resolve(process.env.GOPATH!, 'src', 'github.com', 'gamejolt', 'joltron')
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

export async function buildJoltron(options: { environment: Options['environment'] }) {
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

	const isDevelopment = options.environment === 'development';

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

export async function restructureProject(options: {
	packageDir: string;
	packageId: number;
	packageBuildId: number;
	environment: Options['environment'];
}) {
	if (joltronExecutableFilepath === null) {
		throw new Error('GOPATH is not set, cannot provide joltron executable to project');
	}

	const installerDir = path.resolve(options.packageDir, '..', 'installer');

	await fs.mkdirp(installerDir);

	console.log('Copying main executable to root of installation directory');
	// Joltron should be placed next to the client build's data folder. On
	// windows joltron will be linked to and executed directly, so call it
	// GameJoltClient.exe to avoid confusion. On linux we call the
	// executable game-jolt-client, so we can rename joltron to that. On mac
	// we can also rename it to game-jolt-client for consistency. the
	// executable is contained in the app directory anyways.
	const joltronDest = path.join(
		installerDir,
		isWindows() ? 'GameJoltClient.exe' : 'game-jolt-client'
	);

	await fs.copy(joltronExecutableFilepath!, joltronDest);

	// Make sure it is executable.
	await fs.chmod(joltronDest, '0755');

	console.log('Moving package files to installer data folder');
	// This is joltron's data directory for this client installer build
	const newPackageDir = path.join(
		installerDir,
		`data-${options.packageId}-${options.packageBuildId}`
	);

	// Rename our build folder (which is the contents of our package zip)
	await fs.rename(options.packageDir, newPackageDir);

	console.log('Generating joltron manifest for installer package');
	// Some more info is required for joltron's manifest. The correct host
	// is needed for the platformURL - this tells joltron where to look for updates.
	const hostname =
		options.environment === 'development' ? 'development.gamejolt.com' : 'gamejolt.com';

	// The executable tells joltron what is the executable file within this
	// client build's data folder.
	let executable = '';
	// Joltron expects the platform field to be either windows/mac/linux.
	let platform = '';
	if (isWindows()) {
		executable = 'GameJoltClient.exe';
		platform = 'windows';
	} else if (isMac()) {
		executable = 'Game Jolt Client.app/Contents/MacOS/Game Jolt Client';
		platform = 'mac';
	} else if (isLinux()) {
		executable = 'game-jolt-client';
		platform = 'linux';
	} else {
		throw new Error('Unsupported OS');
	}

	// Figure out the archive file list.
	const archiveFiles = (await readdirp.promise(newPackageDir))
		.map(i => './' + i.path.replace(/\\/g, '/'))
		.sort();

	// Finally create joltron's manifest file
	await fs.writeFile(
		path.join(installerDir, '.manifest'),
		JSON.stringify({
			version: 2,
			autoRun: true,
			gameInfo: {
				dir: path.basename(newPackageDir),
				uid: `${options.packageId}-${options.packageBuildId}`,
				archiveFiles: archiveFiles,
				platformUrl: `https://${hostname}/x/updater/check-for-updates`,
				declaredImplementations: {
					presence: true,
					badUpdateRecovery: true,
				},
			},
			launchOptions: { executable: executable },
			os: platform,
			arch: '64',
			isFirstInstall: false,
		}),
		'utf8'
	);

	return installerDir;
}

/**
 * Packages up the client build as an installer.
 *
 * This takes the joltron folder structure we generated in the previous
 * steps and packages it up as an installer for easier distribution
 */
export async function createInstaller(options: {
	installerDir: string;
	outDir: string;
	environment: Options['environment'];
	staging: boolean;
}) {
	console.log('Creating installer');

	if (isMac()) {
		throw new Error('Not implemented');

		// // On mac we need to create an app that when run will execute joltron.
		// // We have a template app we use that contains the minimal setup
		// // required.
		// const appTemplate = path.resolve(__dirname, 'Game Jolt Client.app');
		// const clientApp = path.resolve(config.clientBuildDir, 'Game Jolt Client.app');

		// // We copy it over to the build dir.
		// await fs.copy(appTemplate, clientApp);

		// // We copy the entire joltron folder we generated in the previous
		// // step into the app's Contents/Resources/app folder.
		// const buildDir = path.resolve(config.clientBuildDir, 'dist');
		// const appDir = path.resolve(clientApp, 'Contents', 'Resources', 'app');

		// // TODO: check to make sure it copies the hidden dot files too
		// await fs.copy(buildDir, appDir);

		// // // The . after the build dir makes it also copy hidden dot files
		// // cp.execSync('cp -a "' + path.join(buildDir, '.') + '" "' + appDir + '"');

		// // TODO: use simple-plist
		// // The info plist in our template has placeholder we need to replace
		// // with this build's version.
		// const infoPlistFile = path.join(clientApp, 'Contents', 'Info.plist');
		// const infoPlist = fs
		// 	.readFileSync(infoPlistFile, {
		// 		encoding: 'utf8',
		// 	})
		// 	.replace(/\{\{APP_VERSION\}\}/g, packageJson.version);

		// await fs.writeFile(infoPlistFile, infoPlist, { encoding: 'utf8' });

		// const _createDmg = () => {
		// 	const appdmg = require('appdmg');

		// 	const dmg = appdmg({
		// 		target: path.resolve(config.clientBuildDir, 'GameJoltClient.dmg'),
		// 		basepath: config.projectBase,
		// 		specification: {
		// 			// DO NOT ADD ANY SPACES (or chinese characters) - the background will disappear apparently
		// 			title: 'GameJolt',
		// 			icon: path.resolve(__dirname, 'client/icons/mac.icns'),
		// 			background: path.resolve(__dirname, 'client/icons/dmg-background.png'),
		// 			'icon-size': 80,
		// 			contents: [
		// 				{
		// 					x: 195,
		// 					y: 370,
		// 					type: 'file',
		// 					path: clientApp,
		// 				},
		// 				{ x: 429, y: 370, type: 'link', path: '/Applications' },
		// 			],
		// 		},
		// 	});

		// 	return new Promise((resolve, reject) => {
		// 		dmg.on('progress', info => {
		// 			console.log(info);
		// 		});

		// 		dmg.on('finish', () => {
		// 			console.log('Finished building DMG.');
		// 			resolve();
		// 		});

		// 		dmg.on('error', err => {
		// 			console.error(err);
		// 			reject(err);
		// 		});
		// 	});
		// };

		// // Finally, create a dmg out of the entire app.
		// await _createDmg();
	} else if (isWindows()) {
		const manifest = JSON.parse(
			await fs.readFile(path.join(options.installerDir, '.manifest'), {
				encoding: 'utf8',
			})
		);

		const useProdCert = options.environment === 'production';

		const certFile = useProdCert
			? path.resolve(__dirname, 'certs', 'cert.pfx')
			: path.resolve(__dirname, 'vendor', 'cert.pfx');

		const certPw = (useProdCert ? process.env['GJ_CERT_PASS'] : 'GJ123456')?.trim();

		if (!certPw) {
			throw new Error(
				'Code signing cert password not specified. Expecting to have GJ_CERT_PASS environment variable.'
			);
		}

		await buildInnoSetup({
			installerDir: options.installerDir,
			outDir: options.outDir,
			version: packageJson.version,
			gameUID: manifest.gameInfo.uid,
			certFile,
			certPw,
		});

		return path.join(options.outDir, 'GameJoltClientSetup.exe');
	} else if (isLinux()) {
		const installerFilepath = path.join(options.outDir, 'GameJoltClient.tar.gz');
		await createTarGz(options.installerDir, installerFilepath);
		return installerFilepath;
	}

	throw new Error('Unsupported OS');
}
