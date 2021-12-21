const argv = require('minimist')(process.argv);
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const fs = require('fs-extra');
const path = require('path');
const readdirp = require('readdirp');
const cp = require('child_process');
const http = require('http');
const { buildInnoSetup } = require('./client/inno-setup');
const { NwBuilder } = require('./client/nw-builder');
const {
	sleep,
	createTarGz,
	unzip,
	runShell,
	downloadFile,
	tryWithBackoff,
} = require('./build-utils');

module.exports = config => {
	const packageJson = require(path.resolve(__dirname, '../../package.json'));

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
	let gjGamePackageId;
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

	gulp.task('package-client', async () => {
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

		/**
		 * This will do the actual nwjs build.
		 */
		async function buildNwjs() {
			console.log('Building NW.js');

			const nw = new NwBuilder(config, packageJson);
			await nw.build();
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
				' git@github.com:gamejolt/joltron.git ' +
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
					{ command: path.join('build', 'deps.bat'), args: [] },
					{
						command: path.join('build', 'build.bat'),
						args: [`-l${config.development ? 'd' : ''}`],
					},
				];
			} else {
				commands = [
					{ command: path.join('build', 'deps.sh'), args: [] },
					{
						command: path.join('build', 'build.sh'),
						args: [`-l${config.development ? 'd' : ''}`],
					},
				];
			}

			for (const { command, args } of commands) {
				await runShell(command, { args, cwd: joltronRepoDir });
			}
		}

		/**
		 * Structure the build folder with joltron, as if it was installed by it.
		 * This is what we want our installer to unpack.
		 */
		async function setupJoltron() {
			console.log('Setting up Joltron');

			// We need to know our build ID for the package zip we just uploaded,
			// because the build id is part of the game UID ("packageId-buildId)"
			// which we need for joltron's manifest file. So we can use the service
			// API to query it!

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

			const buildId = build.id;

			await fs.mkdirp(path.resolve(config.clientBuildDir, 'dist'));

			// This is joltron's data directory for this client build
			const buildDir = path.resolve(
				config.clientBuildDir,
				'dist',
				'data-' + gjGamePackageId + '-' + buildId
			);

			// Rename our build folder (which is the contents of our package zip)
			await fs.rename(path.resolve(config.clientBuildDir, 'build'), buildDir);

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
				const buildDir = path.resolve(config.clientBuildDir, 'dist');
				const appDir = path.resolve(clientApp, 'Contents', 'Resources', 'app');

				// TODO: check to make sure it copies the hidden dot files too
				await fs.copy(buildDir, appDir);

				// // The . after the build dir makes it also copy hidden dot files
				// cp.execSync('cp -a "' + path.join(buildDir, '.') + '" "' + appDir + '"');

				// TODO: use simple-plist
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
							// DO NOT ADD ANY SPACES (or chinese characters) - the background will disappear apparently
							title: 'GameJolt',
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
					await fs.readFile(path.resolve(config.clientBuildDir, 'dist', '.manifest'), {
						encoding: 'utf8',
					})
				);

				const certFile = config.production
					? path.resolve(__dirname, 'client/certs/cert.pfx')
					: path.resolve(__dirname, 'client/vendor/cert.pfx');
				const certPw = config.production ? process.env['GJ_CERT_PASS'] : 'GJ123456';

				await buildInnoSetup(
					path.resolve(config.clientBuildDir, 'dist'),
					path.resolve(config.clientBuildDir),
					packageJson.version,
					manifest.gameInfo.uid,
					certFile,
					certPw.trim()
				);
			} else {
				await createTarGz(
					path.join(config.clientBuildDir, 'dist'),
					path.join(config.clientBuildDir, 'GameJoltClient.tar.gz')
				);
			}
		}

		// Clean the build folder to start fresh.
		await fs.remove(config.clientBuildDir);

		await buildNwjs();
		await getJoltron();
		await setupJoltron();
		await createInstaller();

		console.log('Done with client build.');
	});

	gulp.task('push-client', async () => {
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

			// We trust the exit codes to tell us if something went wrong
			// because a non 0 exit code will make this throw.
			const gjPush = () =>
				runShell(gjpushExecutable, {
					args: [
						'--no-resume',
						'-g',
						gjGameId,
						'-p',
						gjGamePackageId,
						'-r',
						packageJson.version,
						path.resolve(
							config.clientBuildDir,
							config.platformArch + '-package.tar.gz'
						),
					],
				});

			// Let's try to be resilient to network failures by trying a few times.
			await tryWithBackoff(gjPush, 3);
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

			const gjPush = () =>
				runShell(gjpushExecutable, {
					args: [
						'--no-resume',
						'-g',
						gjGameId,
						'-p',
						gjGameInstallerPackageId,
						'-r',
						packageJson.version,
						installerFile,
					],
				});

			// Let's try to be resilient to network failures by trying a few times.
			await tryWithBackoff(gjPush, 3);
		}

		console.log('Pushing client build.');

		await getPushTools();
		await pushPackage();
		await pushInstaller();

		console.log('Finished push.');
	});
};
