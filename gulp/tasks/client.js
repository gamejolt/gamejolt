const argv = require('minimist')(process.argv);
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const fs = require('fs-extra');
const path = require('path');
const readdirp = require('readdirp');
const cp = require('child_process');
const http = require('http');

const {
	sleep,
	createTarGz,
	unzip,
	runShell,
	downloadFile,
	tryWithBackoff,
} = require('./build-utils');

module.exports = config => {
	// We can skip all this stuff if not doing a client build.
	if (!config.isClient) {
		return;
	}

	const packageJson = require(path.resolve(config.projectBase, 'package.json'));

	// Takes the joltron version specified in package.json and expands it into joltronVersionArray. e.g. v2.0.1-beta into [2, 0, 1]
	// The joltron version will specify the loader variant to signal the backend to use the correct variant when offering updates to joltron itself.
	// The loader variant version looks like `${version}.loader`, but git's release version is simply `${version}` so we gotta transform it.
	const joltronVersion = packageJson.joltronVersion.replace(/\.loader$/, '');
	const versionStuff = joltronVersion.match(/^v?(\d+)\.(\d+)\.(\d+)/);
	if (!versionStuff) {
		throw new Error('Joltron version is invalid');
	}
	const joltronVersionArray = [
		parseInt(versionStuff[1]),
		parseInt(versionStuff[2]),
		parseInt(versionStuff[3]),
	];

	const gjpushVersion = 'v0.5.0';
	const gjGameId = config.developmentEnv ? 1000 : 362412;
	let gjGamePazckageId;
	let gjGameInstallerPackageId;
	if (config.developmentEnv) {
		if (!config.useTestPackage) {
			gjGamePackageId = 1001;
			gjGameInstallerPackageId = 1000;
		} else {
			gjGamePackageId = 1004;
			gjGameInstallerPackageId = 1003;
		}
	} else {
		if (!config.useTestPackage) {
			gjGamePackageId = 376715;
			gjGameInstallerPackageId = 376713;
		} else {
			gjGamePackageId = 428842;
			gjGameInstallerPackageId = 428840;
		}
	}
	const nwjsVersion = '0.55.0';

	const clientVoodooDir = path.resolve(config.buildDir, 'node_modules', 'client-voodoo');
	const trashDir = path.resolve(config.clientBuildDir, '.trash');

	let gjpushExecutable = '';
	switch (config.platform) {
		case 'win':
			gjpushExecutable = path.resolve(config.clientBuildDir, 'gjpush.exe');
			break;
		case 'osx':
			gjpushExecutable = path.resolve(config.clientBuildDir, 'gjpush');
			break;
		default:
			gjpushExecutable = path.resolve(config.clientBuildDir, 'gjpush');
			break;
	}

	// This will get set if we end up getting joltron within the build.
	let joltronSrc = '';

	async function moveToTrash(src) {
		try {
			await fs.mkdirp(trashDir);
		} catch (e) {
			console.log(e);
			console.log(e.code);
		}

		const filename = path.basename(src);
		const dest = path.resolve(trashDir, filename + '-' + Date.now());

		console.log(`Moving ${filename} to ${dest}`);
		await fs.move(src, dest);
	}

	/**
	 * Function to issue an authenticated service API request and return the
	 * result as json.
	 */
	function sendApiRequest(url) {
		const options = {
			hostname: config.developmentEnv ? 'development.gamejolt.com' : 'gamejolt.com',
			path: '/service-api/push' + url,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: process.env.GJPUSH_TOKEN,
			},
		};

		return new Promise((resolve, reject) => {
			http.request(options, res => {
				res.setEncoding('utf8');

				let str = '';
				res.on('data', data => {
					str += data;
				}).on('end', () => {
					resolve(JSON.parse(str));
				});
			})
				.on('error', reject)
				.end();
		});
	}

	/**
	 * We need to set up our node modules before doing the nwjs build,
	 * specifically for what we need for client.
	 */
	async function setupNodeModules() {
		console.log('Setting up node modules');

		let commands = [
			'yarn --cwd ' + path.normalize(config.buildDir) + ' --production --ignore-scripts',
			// We have to run client-voodoo's post install to get the joltron
			// binaries in.
			'yarn --cwd ' + clientVoodooDir + ' run postinstall',
		];

		if (!config.production) {
			// When creating a development build sometimes we need some
			// dependencies to be built in as is. this allows us to make builds
			// without having to publish a billion versions every time we want
			// to test something.
			const devDependenciesToAddAsIs = ['client-voodoo'];
			for (let depName of devDependenciesToAddAsIs) {
				const devDep = path.resolve(config.projectBase, 'node_modules', depName);
				const buildDep = path.resolve(config.buildDir, 'node_modules', depName);

				if (config.platform === 'win') {
					commands.push('xcopy /E /Y /I ' + devDep + ' ' + buildDep);
				} else {
					commands.push(
						'rm -rf ' + buildDep,
						'mkdir -p ' + buildDep,
						'cp -r ' + devDep + ' ' + path.dirname(buildDep)
					);
				}
			}
		}

		for (const command of commands) {
			await runShell(command);
		}
	}

	/**
	 * This will do the actual nwjs build.
	 */
	async function buildNwjs() {
		console.log('Building nwjs');

		const NwBuilder = require('nw-builder');

		// We want the name to be:
		// 'game-jolt-client' on linux - because kebabs rock
		// 'GameJoltClient' on win - so it shows up well in process list and stuff
		// 'Game Jolt Client' on mac - so it shows up well in Applications folder.
		// note that on mac, the installer will unpack a self updating app and contain this NW executable entirely within itself.
		let appName = 'game-jolt-client';
		if (config.platform === 'win') {
			appName = 'GameJoltClient';
		} else if (config.platform === 'osx') {
			appName = 'Game Jolt Client';
		}

		const nw = new NwBuilder({
			version: nwjsVersion,
			flavor: config.production && !config.useTestPackage ? 'normal' : 'sdk',
			files: config.buildDir + '/**/*',
			buildDir: config.clientBuildDir,
			cacheDir: config.clientBuildCacheDir,
			platforms: [config.platformArch],
			appName: appName,
			buildType: () => 'build',
			appVersion: packageJson.version,
			macZip: false, // Use a app.nw folder instead of ZIP file
			macIcns: path.resolve(__dirname, 'client/icons/mac.icns'),
			macPlist: {
				CFBundleIdentifier: 'com.gamejolt.client',
			},
			winIco: path.resolve(__dirname, 'client/icons/winico.ico'),

			// Tells it not to merge the app zip into the executable. Easier updating this way.
			mergeApp: false,
		});

		nw.on('log', console.log);

		return nw.build();
	}

	/**
	 * On windows and linux the app is packaged into an package.nw file,
	 * but for easier debugging we want to unpack it into the build folder
	 */
	async function unpackNw() {
		console.log('Unpacking nw');

		// We don't do this on mac.
		if (config.platform === 'osx') {
			console.log(`Skipping since we're on mac`);
			return;
		}

		const base = path.resolve(config.clientBuildDir, 'build', config.platformArch);
		const packageNw = path.resolve(base, 'package.nw');

		if (!(await fs.pathExists(packageNw))) {
			throw new Error(`Couldn't find package.nw.`);
		}

		console.log('Unzipping from package.nw to ' + path.resolve(base, 'package'));
		console.log('base: ' + base + ', packageNw: ' + packageNw);

		await unzip(packageNw, path.resolve(base, 'package'));

		// This solves an issue on windows where for some reason we get
		// permission errors when moving the node_modules folder.
		await sleep(1000);

		// We pull some stuff out of the package folder into the main folder.
		await fs.move(
			path.resolve(base, 'package', 'node_modules'),
			path.resolve(base, 'node_modules')
		);

		await fs.move(
			path.resolve(base, 'package', 'package.json'),
			path.resolve(base, 'package.json')
		);

		// For some reason unlinking package.nw fails so we just move it out of
		// the way instead.
		await moveToTrash(packageNw);
	}

	/**
	 * Gets the prebuilt ffmpeg library and installs it into the package.
	 */
	async function setupPrebuiltFFmpeg() {
		// TODO: download and cache the correct things for os/arch
		const cachePathZip = path.resolve(
			config.clientBuildCacheDir,
			'ffmpeg-prebuilt-${nwjsVersion}-linux-x64.zip'
		);
		const cachePathExtracted = path.resolve(
			config.clientBuildCacheDir,
			'ffmpeg-prebuilt-${nwjsVersion}-linux-x64'
		);

		if (!(await fs.pathExists(cachePathExtracted))) {
			const url = `https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/${nwjsVersion}/${nwjsVersion}-linux-x64.zip`;
			console.log(`Downloading ffmpeg-prebuilt for nwjs: ${url}`);

			await downloadFile(url, cachePathZip);
			await unzip(cachePathZip, cachePathExtracted);
		}

		console.log('Installing ffmpeg-prebuilt to the package directory');

		const base = path.resolve(config.clientBuildDir, 'build', config.platformArch);

		let to, filename;
		if (config.platform === 'windows') {
			filename = 'ffmpeg.dll';
			to = path.resolve(base, filename);
		} else if (config.platform === 'osx') {
			filename = 'libffmpeg.dylib';
			// TODO: I don't know the inner folder path yet
			to = path.resolve(base, filename);
		} else if (config.platform === 'linux') {
			filename = 'libffmpeg.so';
			to = path.resolve(base, 'lib', filename);
		}

		await fs.copy(path.resolve(cachePathExtracted, filename), to);
	}

	/**
	 * Makes the zipped package.
	 *
	 * Note: this is not the package shipped with joltron so it doesn't use the
	 * auto updater. It's essentially the "game" people upload to GJ.
	 */
	async function zipPackage() {
		console.log('Zipping up our package');

		await createTarGz(
			path.resolve(config.clientBuildDir, 'build', config.platformArch),
			path.resolve(config.clientBuildDir, config.platformArch + '-package.tar.gz')
		);
	}

	/**
	 * Downloads the gjpush binary used to push the package and installers to GJ
	 * automatically.
	 */
	async function getPushTools() {
		console.log('Getting push tools');

		// In development we want to grab a development variant of it,
		// so we simply copy it over from its Go repo into our build dir.
		if (config.developmentEnv) {
			await fs.copy(
				path.resolve(
					process.env.GOPATH,
					'src',
					'github.com',
					'gamejolt',
					'cli',
					path.basename(gjpushExecutable)
				),
				gjpushExecutable
			);

			console.log('Got development tools');
			return;
		}

		// In prod we fetch the binary from the github releases page. It is
		// zipped on Github because we didn't want to have OS specific filenames
		// like gjpush-win32.exe so we distinguish the OS by the zip name which
		// then contains gjpush.exe for windows or just gjpush for mac/linux.
		let remoteExecutable = '';
		switch (config.platform) {
			case 'win':
				remoteExecutable = 'windows.zip';
				break;
			case 'osx':
				remoteExecutable = 'osx.zip';
				break;
			default:
				remoteExecutable = 'linux.zip';
				break;
		}

		const gjpushZip = path.resolve(config.clientBuildDir, 'gjpush.zip');

		await downloadFile(
			`https://github.com/gamejolt/cli/releases/download/${gjpushVersion}/${remoteExecutable}`,
			gjpushZip
		);

		await unzip(gjpushZip, config.clientBuildDir);

		// Ensure the gjpush binary is executable.
		await fs.chmod(gjpushExecutable, '0755');
	}

	/**
	 * Pushes the single package to GJ.
	 */
	async function pushPackage() {
		console.log('Pushing the package to Game Jolt');

		const gjPush = async () => {
			// We trust the exit codes to tell us if something went wrong
			// because a non 0 exit code will make this throw.
			cp.execFileSync(gjpushExecutable, [
				'--no-resume',
				'-g',
				gjGameId,
				'-p',
				gjGamePackageId,
				'-r',
				packageJson.version,
				path.resolve(config.clientBuildDir, config.platformArch + '-package.tar.gz'),
			]);
		};

		// Let's try to be resilient to network failures by trying a few times.
		await tryWithBackoff(gjPush, 3);
	}

	/**
	 * Ensures we have Joltron locally built.
	 */
	async function getJoltron() {
		console.log('Getting Joltron');

		const joltronRepoDir = path.resolve(
			process.env.GOPATH,
			'src',
			'github.com',
			'gamejolt',
			'joltron'
		);

		console.log('Ensuring gopath dirs: ' + joltronRepoDir);
		await fs.mkdirp(joltronRepoDir);

		joltronSrc = path.resolve(joltronRepoDir, 'joltron');
		if (config.platform === 'win') {
			joltronSrc += '.exe';
		}

		const gitStatus = 'git -C ' + joltronRepoDir + ' status';
		const gitClone =
			'git clone --branch ' +
			joltronVersion +
			' git@github.com:gamejolt/joltron ' +
			joltronRepoDir;

		// Do status first, if it fails it means the repo doesn't exist, so try
		// cloning.
		await runShell(`${gitStatus} || ${gitClone}`);

		if (config.platform === 'win') {
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
					IconPath: path.resolve(__dirname, 'client/icons/winico.ico'),
					ManifestPath: '',
				}),
				{ encoding: 'utf8' }
			);
		}

		let commands = [];
		if (config.platform === 'win') {
			commands = [
				path.join('build', 'deps.bat'),
				path.join('build', 'build.bat') + ' -l' + (config.development ? 'd' : ''),
			];
		} else {
			commands = [
				path.join('build', 'deps.sh'),
				path.join('build', 'build.sh') + ' -l' + (config.development ? 'd' : ''),
			];
		}

		for (const command of commands) {
			await runShell(command, { cwd: joltronRepoDir });
		}
	}

	/**
	 * Structure the build folder with joltron, as if it was installed by it.
	 * This is what we want our installer to unpack.
	 */
	async function setupJoltron() {
		console.log('Setting up Joltron');

		// If we want to skip gjpush to test the packaging we need to provide
		// the build ID ourselves because we won't be hitting service-api to get
		// it.
		let buildId = 739828;

		// We need to know our build ID for the package zip we just uploaded,
		// because the build id is part of the game UID ("packageId-buildId)"
		// which we need for joltron's manifest file. So we can use the service
		// API to query it!
		if (config.pushBuild) {
			// First step is getting the release ID matching the version we just
			// uploaded.
			const releasePayload = await sendApiRequest(
				'/releases/by-version/' + gjGamePackageId + '/' + packageJson.version
			);

			// Then find the builds for that version.
			const buildPayload = await sendApiRequest(
				'/releases/builds/' +
					releasePayload.release.id +
					'?game_id=' +
					gjGameId +
					'&package_id=' +
					gjGamePackageId
			);

			// The build matching the filename we just uploaded is the build ID
			// we're after.
			const build = data.builds.data.find(i => {
				return i && i.file && i.file.filename === config.platformArch + '-package.tar.gz';
			});
			if (!build) {
				throw new Error('Could not get build');
			}

			buildId = build.id;
		}

		// This is joltron's data directory for this client build
		const buildDir = path.resolve(
			config.clientBuildDir,
			'build',
			'data-' + gjGamePackageId + '-' + buildId
		);

		// Rename our build folder (which is the contents of our package zip)
		await fs.rename(
			path.resolve(config.clientBuildDir, 'build', config.platformArch),
			buildDir
		);

		// Next up we want to fetch the same joltron version as the client build
		// is using, even if there is a newer version of joltron released. This
		// ensures the client and joltron can communicate without issues.

		// Joltron should be placed next to the client build's data folder. On
		// windows joltron will be linked to and executed directly, so call it
		// GameJoltClient.exe to avoid confusion. On linux we call the
		// executable game-jolt-client, so we can rename joltron to that. On mac
		// we can also rename it to game-jolt-client for consistency. the
		// executable is contained in the app directory anyways.
		const joltronDest = path.resolve(
			buildDir,
			'..',
			config.platform === 'win' ? 'GameJoltClient.exe' : 'game-jolt-client'
		);

		// Some more info is required for joltron's manifest. The correct host
		// is needed for the platformURL - this tells joltron where to look for
		// updates.
		const gjHost = config.developmentEnv
			? 'http://development.gamejolt.com'
			: 'https://gamejolt.com';

		// The executable tells joltron what is the executable file within this
		// client build's data folder.
		let executable = '';
		if (config.platform === 'win') {
			executable = 'GameJoltClient.exe';
		} else if (config.platform === 'osx') {
			executable = 'Game Jolt Client.app/Contents/MacOS/nwjs';
		} else {
			executable = 'game-jolt-client';
		}

		// Joltron expects the platform field to be either windows/mac/linux.
		let platform = '';
		if (config.platform === 'win') {
			platform = 'windows';
		} else if (config.platform === 'osx') {
			platform = 'mac';
		} else {
			platform = 'linux';
		}

		// Figure out the archive file list.
		const archiveFiles = (await readdirp.promise(buildDir))
			.map(i => './' + i.path.replace(/\\/g, '/'))
			.sort();

		await fs.copy(joltronSrc, joltronDest);

		// Make sure it is executable.
		await fs.chmod(joltronDest, '0755');

		// Finally create joltron's manifest file
		await fs.writeFile(
			path.resolve(buildDir, '..', '.manifest'),
			JSON.stringify({
				version: 2,
				autoRun: true,
				gameInfo: {
					dir: path.basename(buildDir),
					uid: gjGamePackageId + '-' + buildId,
					archiveFiles: archiveFiles,
					platformUrl: gjHost + '/x/updater/check-for-updates',
					declaredImplementations: {
						presence: true,
						badUpdateRecovery: true,
					},
				},
				launchOptions: { executable: executable },
				os: platform,
				arch: config.arch + '',
				isFirstInstall: false,
			}),
			'utf8'
		);
	}

	/**
	 * Packages up the client build as an installer.
	 *
	 * This takes the joltron folder structure we generated in the previous
	 * steps and packages it up as an installer for easier distribution
	 */
	async function createInstaller() {
		console.log('Creating installer');

		if (config.platform === 'osx') {
			// On mac we need to create an app that when run will execute joltron.
			// We have a template app we use that contains the minimal setup
			// required.
			const appTemplate = path.resolve(__dirname, 'client', 'Game Jolt Client.app');
			const clientApp = path.resolve(config.clientBuildDir, 'Game Jolt Client.app');

			// We copy it over to the build dir.
			await fs.copy(appTemplate, clientApp);

			// We copy the entire joltron folder we generated in the previous
			// step into the app's Contents/Resources/app folder.
			const buildDir = path.resolve(config.clientBuildDir, 'build');
			const appDir = path.resolve(clientApp, 'Contents', 'Resources', 'app');

			// TODO: check to make sure it copies the hidden dot files too
			await fs.copy(buildDir, appDir);

			// // The . after the build dir makes it also copy hidden dot files
			// cp.execSync('cp -a "' + path.join(buildDir, '.') + '" "' + appDir + '"');

			// The info plist in our template has placeholder we need to replace
			// with this build's version.
			const infoPlistFile = path.join(clientApp, 'Contents', 'Info.plist');
			const infoPlist = fs
				.readFileSync(infoPlistFile, {
					encoding: 'utf8',
				})
				.replace(/\{\{APP_VERSION\}\}/g, packageJson.version);

			await fs.writeFile(infoPlistFile, infoPlist, { encoding: 'utf8' });

			const _createDmg = () => {
				const appdmg = require('appdmg');

				const dmg = appdmg({
					target: path.resolve(config.clientBuildDir, 'GameJoltClient.dmg'),
					basepath: config.projectBase,
					specification: {
						title: 'Game Jolt Client',
						icon: path.resolve(__dirname, 'client/icons/mac.icns'),
						background: path.resolve(__dirname, 'client/icons/dmg-background.png'),
						'icon-size': 80,
						contents: [
							{
								x: 195,
								y: 370,
								type: 'file',
								path: clientApp,
							},
							{ x: 429, y: 370, type: 'link', path: '/Applications' },
						],
					},
				});

				return new Promise((resolve, reject) => {
					dmg.on('progress', info => {
						console.log(info);
					});

					dmg.on('finish', () => {
						console.log('Finished building DMG.');
						resolve();
					});

					dmg.on('error', err => {
						console.error(err);
						reject(err);
					});
				});
			};

			// Finally, create a dmg out of the entire app.
			await _createDmg();
		} else if (config.platform === 'win') {
			const manifest = JSON.parse(
				await fs.readFile(path.resolve(config.clientBuildDir, 'build', '.manifest'), {
					encoding: 'utf8',
				})
			);

			const InnoSetup = require('./client/inno-setup').default;
			const certFile = config.production
				? path.resolve(__dirname, 'client/certs/cert.pfx')
				: path.resolve(__dirname, 'client/vendor/cert.pfx');
			const certPw = config.production ? process.env['GJ_CERT_PASS'] : 'GJ123456';
			const builder = new InnoSetup(
				path.resolve(config.clientBuildDir, 'build'),
				path.resolve(config.clientBuildDir),
				packageJson.version,
				manifest.gameInfo.uid,
				certFile,
				certPw.trim()
			);
			await builder.build();
		} else {
			await createTarGz(
				path.join(config.clientBuildDir, 'build'),
				path.join(config.clientBuildDir, 'GameJoltClient.tar.gz')
			);
		}
	}

	/**
	 * Pushes the installer to GJ.
	 */
	async function pushInstaller() {
		console.log('Pushing installer to Game Jolt');

		// TODO this is probably broken for windows/linux
		let installerFile = '';
		switch (config.platform) {
			case 'win':
				installerFile = 'GameJoltClientSetup.exe';
				break;
			case 'osx':
				installerFile = 'GameJoltClient.dmg';
				break;
			default:
				installerFile = 'GameJoltClient.tar.gz';
				break;
		}
		installerFile = path.resolve(config.clientBuildDir, installerFile);

		const gjPush = async () => {
			cp.execFileSync(gjpushExecutable, [
				'--no-resume',
				'-g',
				gjGameId,
				'-p',
				gjGameInstallerPackageId,
				'-r',
				packageJson.version,
				installerFile,
			]);
		};

		// Let's try to be resilient to network failures by trying a few times.
		await tryWithBackoff(gjPush, 3);
	}

	gulp.task('client', async () => {
		await setupNodeModules();
		await buildNwjs();
		await unpackNw();
		await setupPrebuiltFFmpeg();
		await zipPackage();

		if (config.pushBuild) {
			await getPushTools();
			await pushPackage();
		}

		await getJoltron();
		await setupJoltron();
		await createInstaller();

		if (config.pushBuild) {
			await pushInstaller();
		}

		console.log('Done with client build.');
	});
};
