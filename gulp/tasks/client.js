const argv = require('minimist')(process.argv);
const gulp = require('gulp');
const gutil = require('gulp-util');
const plugins = require('gulp-load-plugins')();
const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const shell = require('gulp-shell');
const path = require('path');
const mv = require('mv');
const readdir = require('fs-readdir-recursive');
const https = require('follow-redirects').https;
const DecompressZip = require('decompress-zip');
const cp = require('child_process');
const http = require('http');
const escape = require('shell-escape');
const tar = require('tar');

module.exports = config => {
	// We can skip all this stuff if not doing a client build.
	if (!config.client) {
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

	const gjpushVersion = 'v0.2.0';
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
	const nwjsVersion = '0.35.5';

	const clientVoodooDir = path.join(config.buildDir, 'node_modules', 'client-voodoo');

	let nodeModulesTask = [
		'cd ' + config.buildDir + ' && yarn --production --ignore-scripts',
		'cd ' + clientVoodooDir + ' && yarn run postinstall', // We have to run client-voodoo's post install to get the joltron binaries in.
	];

	if (!config.production) {
		// When creating a development build sometimes we need some dependencies to be built in as is.
		// this allows us to make builds without having to publish a billion versions every time we want to test something.
		const devDependenciesToAddAsIs = ['client-voodoo'];
		for (let depName of devDependenciesToAddAsIs) {
			const devDep = path.resolve(config.projectBase, 'node_modules', depName);
			const buildDep = path.resolve(config.buildDir, 'node_modules', depName);

			if (config.platform === 'win') {
				nodeModulesTask.push('xcopy /E /Y /I ' + devDep + ' ' + buildDep);
			} else {
				nodeModulesTask.push(
					'rm -rf ' + buildDep,
					'mkdir -p ' + buildDep,
					'cp -r ' + devDep + ' ' + path.dirname(buildDep)
				);
			}
		}
	}

	gulp.task('client:node-modules', shell.task(nodeModulesTask));

	/**
	 * Does the actual building into an NW executable.
	 */
	gulp.task('client:nw', () => {
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
			flavor: config.production ? 'normal' : 'sdk',
			files: config.buildDir + '/**/*',
			buildDir: config.clientBuildDir,
			cacheDir: config.clientBuildCacheDir,
			platforms: [config.platformArch],
			appName: appName,
			buildType: () => {
				return 'build';
			},
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
	});

	let gjpushExecutable = '';
	let remoteExecutable = '';

	switch (config.platform) {
		case 'win':
			gjpushExecutable = path.join(config.clientBuildDir, 'gjpush.exe');
			break;
		case 'osx':
			gjpushExecutable = path.join(config.clientBuildDir, 'gjpush');
			break;
		default:
			gjpushExecutable = path.join(config.clientBuildDir, 'gjpush');
			break;
	}

	/**
	 * Downloads the gjpush binary used to push the package and installers to GJ automatically.
	 */
	gulp.task('client:get-gjpush', () => {
		// In development we want to grab a development variant of it,
		// so we simply copy it over from its Go repo into our build dir.
		if (config.developmentEnv) {
			cp.execSync(
				'cp "' +
					path.join(
						process.env.GOPATH,
						'src',
						'github.com',
						'gamejolt',
						'cli',
						path.basename(gjpushExecutable)
					) +
					'" "' +
					gjpushExecutable +
					'"'
			);
			return Promise.resolve();
		}

		// In prod we fetch the binary from the github releases page.
		// It is zipped on Github because we didn't want to have OS specific filenames like gjpush-win32.exe
		// so we distinguish the OS by the zip name which then contains gjpush.exe for windows or just gjpush for mac/linux.
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
		const options = {
			host: 'github.com',
			path: '/gamejolt/cli/releases/download/' + gjpushVersion + '/' + remoteExecutable,
		};

		const gjpushZip = path.join(config.clientBuildDir, 'gjpush.zip');
		const file = fs.createWriteStream(gjpushZip);

		// Download the gjpush zip.
		return new Promise((resolve, reject) => {
			https
				.get(options, res => {
					if (res.statusCode !== 200) {
						return reject(
							new Error('Invalid status code. Expected 200 got ' + res.statusCode)
						);
					}

					res.pipe(file);
					file.on('finish', () => {
						file.close();
						resolve();
					});
				})
				.on('error', err => {
					reject(err);
				})
				.end();
		})
			.then(() => {
				// Extract it to our client build folder.
				return new Promise((resolve, reject) => {
					const unzipper = new DecompressZip(gjpushZip);

					unzipper.on('error', reject);
					unzipper.on('extract', () => resolve());
					unzipper.extract({ path: config.clientBuildDir });
				});
			})
			.then(() => {
				// Ensure the gjpush binary is executable.
				fs.chmodSync(gjpushExecutable, 0o755);
			});
	});

	/**
	 * On windows and linux the app is packaged into an package.nw file,
	 * but for easier debugging we want to unpack it into the build folder
	 */
	gulp.task('client:unpack-package.nw', () => {
		let p = Promise.resolve();

		if (config.platform !== 'osx') {
			const base = path.join(config.clientBuildDir, 'build', config.platformArch);
			const packageNw = path.join(base, 'package.nw');

			if (fs.existsSync(packageNw)) {
				console.log('Unzipping from package.nw to ' + path.join(base, 'package'));
				console.log('base: ' + base + ', packageNw: ' + packageNw);

				p = new Promise((resolve, reject) => {
					const unzipper = new DecompressZip(packageNw);

					unzipper.on('error', reject);
					unzipper.on('extract', () => {
						// This solves an issue on windows where for some reason we get permission errors when moving the node_modules folder.
						setTimeout(() => {
							// We pull some stuff out of the package folder into the main folder.
							mv(
								path.join(base, 'package', 'node_modules'),
								path.join(base, 'node_modules'),
								err => {
									if (err) {
										reject(err);
										return;
									}

									mv(
										path.join(base, 'package', 'package.json'),
										path.join(base, 'package.json'),
										err => {
											if (err) {
												reject(err);
												return;
											}

											fs.unlink(packageNw, err => {
												if (err) {
													reject(err);
													return;
												}
												resolve();
											});
										}
									);
								}
							);
						}, 1000);
					});
					unzipper.extract({ path: path.join(base, 'package') });
				});
			}
		}

		return p;
	});

	function targz(src, dest) {
		return tar.c(
			{
				file: dest,
				gzip: true,
				C: path.resolve(src),
				portable: true,
			},
			['./']
		);
	}

	/**
	 * Makes the zipped package.
	 * Note: this is not the package shipped with joltron so it doesn't use the new auto updater.
	 * It's essentially the "game" people upload to GJ.
	 */
	gulp.task('client:zip-package', () => {
		return targz(
			path.join(config.clientBuildDir, 'build', config.platformArch),
			path.join(config.clientBuildDir, config.platformArch + '-package.tar.gz')
		);
	});

	/**
	 * Pushes the single package to GJ.
	 */
	gulp.task('client:gjpush-package', cb => {
		// GJPUSH!
		// We trust the exit codes to tell us if something went wrong because a non 0 exit code will make this throw.
		cp.execFileSync(gjpushExecutable, [
			'-g',
			gjGameId,
			'-p',
			gjGamePackageId,
			'-r',
			packageJson.version,
			path.join(config.clientBuildDir, config.platformArch + '-package.tar.gz'),
		]);

		cb();
	});

	let joltronSrc = '';

	const joltronRepoDir = path.join(
		process.env.GOPATH,
		'src',
		'github.com',
		'gamejolt',
		'joltron'
	);

	if (!fs.existsSync(joltronRepoDir)) {
		console.log('Creating gopath dirs: ' + joltronRepoDir);
		if (config.platform === 'win') {
			cp.execSync('mkdir "' + joltronRepoDir + '"');
		} else {
			cp.execSync('mkdir -p "' + joltronRepoDir + '"');
		}
	}

	joltronSrc = path.join(joltronRepoDir, 'joltron');
	if (config.platform === 'win') {
		joltronSrc += '.exe';
	}

	gulp.task('client:get-joltron', () => {
		return new Promise((resolve, reject) => {
			const func = shell.task([
				'git -C ' +
					joltronRepoDir +
					' status' +
					' || git clone --branch ' +
					joltronVersion +
					' https://github.com/gamejolt/joltron ' +
					joltronRepoDir,
			]);

			func(err => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		})
			.then(() => {
				if (config.platform === 'win') {
					fs.writeFileSync(
						path.join(joltronRepoDir, 'versioninfo.json'),
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
								CompanyName: 'Lucent Web Creative, LLC',
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
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					let cmds = [];
					if (config.platform === 'win') {
						cmds = [
							path.join('build', 'deps.bat'),
							path.join('build', 'build.bat') +
								' -l' +
								(config.development ? 'd' : ''),
						];
					} else {
						cmds = [
							path.join('build', 'deps.sh'),
							path.join('build', 'build.sh') +
								' -l' +
								(config.development ? 'd' : ''),
						];
					}

					const func = shell.task(cmds, { cwd: joltronRepoDir });

					func(err => {
						if (err) {
							reject(err);
							return;
						}
						resolve();
					});
				});
			});
	});

	/**
	 * Structured the build folder with joltron, as if it was installed by it.
	 * This is what we want our installer to unpack.
	 */
	gulp.task('client:joltron', () => {
		let buildIdPromise = Promise.resolve();

		if (config.noGjPush) {
			// If we want to skip gjpush to test the packaging we need to provide the build id ourselves because we won't be hitting service-api to get it.
			const gjGameBuildId = 1;

			buildIdPromise = buildIdPromise.then(() => gjGameBuildId);
		} else {
			// Function to issue an authenticated service API request and return the result as json..
			let serviceApiRequest = url => {
				let options = {
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
			};

			// We need to know our build ID for the package zip we just uploaded,
			// because the build id is part of the game UID ("packageId-buildId)"
			// which we need for joltron's manifest file.
			// So we can use the service API to query it!

			// First step is getting the release ID matching the version we just uploaded.
			buildIdPromise = serviceApiRequest(
				'/releases/by_version/' + gjGamePackageId + '/' + packageJson.version
			)
				.then(data => {
					// Then find the builds for that version.
					return serviceApiRequest(
						'/releases/builds/' +
							data.release.id +
							'?game_id=' +
							gjGameId +
							'&package_id=' +
							gjGamePackageId
					);
				})
				.then(data => {
					// The build matching the filename we just uploaded is the build ID we're after.
					return data.builds.data.find(build => {
						return (
							build &&
							build.file &&
							build.file.filename === config.platformArch + '-package.tar.gz'
						);
					});
				})
				.then(build => {
					if (!build) {
						throw new Error('Could not get build');
					}

					return build.id;
				});
		}

		return buildIdPromise.then(buildId => {
			// This is joltron's data directory for this client build
			const buildDir = path.resolve(
				config.clientBuildDir,
				'build',
				'data-' + gjGamePackageId + '-' + buildId
			);

			// So rename our build folder (which is the contents of our package zip) to it
			fs.renameSync(
				path.resolve(config.clientBuildDir, 'build', config.platformArch),
				buildDir
			);

			// Next up we want to fetch the same joltron version as the client build is using,
			// even if there is a newer version of joltron released.
			// This ensures the client and joltron can communicate without issues.

			// Joltron should be placed next to the client build's data folder.
			// On windows joltron will be linked to and executed directly, so call it GameJoltClient.exe to avoid confusion.
			// On linux we call the executable game-jolt-client, so we can rename joltron to that.
			// On mac we can also rename it to game-jolt-client for consistency. the executable is contained in the app directory anyways.
			const joltronDest = path.resolve(
				buildDir,
				'..',
				config.platform === 'win' ? 'GameJoltClient.exe' : 'game-jolt-client'
			);

			// Some more info is required for joltron's manifest.
			// the correct host is needed for the platformURL - this tells joltron where to look for updates.
			const gjHost = config.developmentEnv
				? 'http://development.gamejolt.com'
				: 'https://gamejolt.com';

			// The executable tells joltron what is the executable file within this client build's data folder.
			let executable = '';
			if (config.platform === 'win') {
				executable = 'GameJoltClient.exe';
			} else if (config.platform === 'osx') {
				executable = 'Game Jolt Client.app/Contents/MacOS/nwjs';
			} else {
				executable = 'game-jolt-client';
			}

			// joltron expects the platform field to be either windows/mac/linux
			let platform = '';
			if (config.platform === 'win') {
				platform = 'windows';
			} else if (config.platform === 'osx') {
				platform = 'mac';
			} else {
				platform = 'linux';
			}

			// Figure out the archive file list.
			const archiveFiles = readdir(buildDir)
				.map(file => './' + file.replace(/\\/g, '/'))
				.sort();

			return new Promise((resolve, reject) => {
				// Finally, copy joltron executable over.
				fs.createReadStream(joltronSrc)
					.pipe(fs.createWriteStream(joltronDest))
					.on('error', reject)
					.on('close', () => {
						// Make sure it is executable.
						fs.chmodSync(joltronDest, 0755);

						// Finally create joltron's manifest file
						fs.writeFileSync(
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
						resolve();
					});
			});
		});
	});

	/**
	 * Packages up the client build as an installer.
	 * This takes the joltron folder structure we generated in the previous steps and packages it up
	 * as an installer for easier distribution
	 */
	gulp.task('client:installer', cb => {
		if (config.platform === 'osx') {
			// On mac we need to create an app that when run will execute joltron.
			// We have a template app we use that contains the minimal setup required.
			const appTemplate = path.resolve(__dirname, 'client', 'Game Jolt Client.app');
			const clientApp = path.resolve(config.clientBuildDir, 'Game Jolt Client.app');

			// We copy it over to the build dir
			cp.execSync('cp -r "' + appTemplate + '" "' + clientApp + '"');

			// We copy the entire joltron folder we generated in the previous step into the app's Contents/Resources/app folder.
			const buildDir = path.join(config.clientBuildDir, 'build');
			const appDir = path.join(clientApp, 'Contents', 'Resources', 'app');

			// The . after the build dir makes it also copy hidden dot files
			cp.execSync('cp -r "' + path.join(buildDir, '.') + '" "' + appDir + '"');

			// The info plist in our template has placeholder we need to replace with this build's version
			const infoPlistFile = path.join(clientApp, 'Contents', 'Info.plist');
			const infoPlist = fs
				.readFileSync(infoPlistFile, {
					encoding: 'utf8',
				})
				.replace(/\{\{APP_VERSION\}\}/g, packageJson.version);

			fs.writeFileSync(infoPlistFile, infoPlist, { encoding: 'utf8' });

			// Finally, create a dmg out of the entire app.
			const appdmg = require('appdmg');

			const dmg = appdmg({
				target: config.clientBuildDir + '/GameJoltClient.dmg',
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

			dmg.on('progress', info => {
				console.log(info);
			});
			dmg.on('finish', () => {
				console.log('Finished building DMG.');
				cb();
			});
			dmg.on('error', err => {
				console.error(err);
				cb(err);
			});
		} else if (config.platform === 'win') {
			const manifest = JSON.parse(
				fs.readFileSync(path.join(config.clientBuildDir, 'build', '.manifest'), {
					encoding: 'utf8',
				})
			);

			const InnoSetup = require('./client/inno-setup');
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
			return builder.build();
		} else {
			return targz(
				path.join(config.clientBuildDir, 'build'),
				path.join(config.clientBuildDir, 'GameJoltClient.tar.gz')
			);
		}
	});

	/**
	 * Pushes the installer to GJ
	 */
	gulp.task('client:gjpush-installer', cb => {
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
		installerFile = path.join(config.clientBuildDir, installerFile);

		cp.execFileSync(gjpushExecutable, [
			'-g',
			gjGameId,
			'-p',
			gjGameInstallerPackageId,
			'-r',
			packageJson.version,
			installerFile,
		]);

		cb();
	});

	if (!config.noGjPush) {
		gulp.task(
			'client',
			gulp.series(
				'client:node-modules',
				'client:nw',
				'client:unpack-package.nw',
				'client:zip-package',
				'client:get-gjpush',
				'client:gjpush-package',
				'client:get-joltron',
				'client:joltron',
				'client:installer',
				'client:gjpush-installer'
			)
		);
	} else {
		gulp.task(
			'client',
			gulp.series(
				'client:node-modules',
				'client:nw',
				'client:unpack-package.nw',
				'client:zip-package',
				'client:get-joltron',
				'client:joltron',
				'client:installer'
			)
		);
	}
};
