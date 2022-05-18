import * as fs from 'fs-extra';
import type { RequestInit } from 'node-fetch';
import fetch from 'node-fetch';
import {
	downloadFile,
	isWindows,
	packageJson,
	runShell,
	shellEscape,
	tryWithBackoff,
	unzip,
} from '../utils';
import { Options } from '../vite-options';

const path = require('path') as typeof import('path');
const os = require('os') as typeof import('os');
const https = require('https') as typeof import('https');

export const gjpushVersion = packageJson.gjpushVersion as string;

// Path to the where we clone and build gjpush.
const gjpushRepoDir =
	'GOPATH' in process.env
		? path.resolve(process.env.GOPATH!, 'src', 'github.com', 'gamejolt', 'cli')
		: null;

const gjpushExecutableBasename = isWindows() ? 'gjpush.exe' : 'gjpush';
const gjpushExecutableFilepath =
	typeof gjpushRepoDir === 'string'
		? path.resolve(gjpushRepoDir, gjpushExecutableBasename)
		: null;

export type GjpushOptions = {
	environment: Options['environment'];

	/** Where to cache the push tools in */
	cacheDir: string;
	/** True if to ignore cached version and redownload/build gjpush */
	noCache?: boolean;
};

export class Gjpush {
	constructor(readonly config: GjpushOptions) {}

	get gjpushExecutable() {
		let basename =
			this.config.environment === 'development' ? `gjpush-dev` : `gjpush-${gjpushVersion}`;

		switch (os.type()) {
			case 'Windows_NT':
				basename += '.exe';
				break;

			case 'Darwin':
			case 'Linux':
				break;

			default:
				throw new Error('Unsupported operating system');
		}

		return path.join(this.config.cacheDir, basename);
	}

	async ensureGjpush() {
		const exists = await fs.pathExists(this.gjpushExecutable);
		if (exists && !(this.config.noCache ?? false)) {
			console.log('Using cached gjpush executable');
			return;
		}

		if (this.config.environment === 'development') {
			// In development we don't version gjpush, we always build from repo.
			await this._ensureCloned();
			await this._buildFromSource();
		} else {
			// Otherwise get the versioned executable directly from github.
			await this._downloadPrebuilt();
		}
	}
	/**
	 * Ensures the gjpush repo is cloned locally.
	 * This function does not check out the specific joltron version commit on existing repos.
	 * This allows us to make changes to joltron and test them out in dev.
	 */
	private async _ensureCloned() {
		console.log('Ensuring gjpush is cloned');
		if (gjpushRepoDir === null || gjpushExecutableFilepath === null) {
			throw new Error('GOPATH is not set, cannot build gjpush');
		}

		console.log('Ensuring gjpush repo dir: ' + gjpushRepoDir);
		await fs.mkdirp(gjpushRepoDir);

		const gitStatus = 'git -C ' + shellEscape(gjpushRepoDir) + ' status';
		const gitClone =
			'git clone --branch ' +
			gjpushVersion +
			' git@github.com:gamejolt/cli.git ' +
			shellEscape(gjpushRepoDir);

		// Do status first, if it fails it means the repo doesn't exist, so try cloning.
		await runShell(`${gitStatus} || ${gitClone}`);
	}

	private async _buildFromSource() {
		console.log('Building gjpush from source');
		if (gjpushRepoDir === null) {
			throw new Error('GOPATH is not set, cannot build gjpush');
		}

		const commands: { command: string; args: string[] }[] = [];
		if (isWindows()) {
			commands.push(
				{
					command: 'go',
					args: ['version'],
				},
				{
					command: 'go',
					args: ['get', './...'],
				},
				{
					command: path.join(
						'build',
						this.config.environment === 'development' ? 'dev.bat' : 'prod.bat'
					),
					args: [],
				}
			);
		} else {
			commands.push(
				{
					command: 'go',
					args: ['version'],
				},
				{
					command: 'go',
					args: ['get', './...'],
				},
				{
					command: path.join(
						'build',
						this.config.environment === 'development' ? 'dev.sh' : 'prod.sh'
					),
					args: [],
				}
			);
		}

		for (const { command, args } of commands) {
			await runShell(command, { args, cwd: gjpushRepoDir });
		}

		await fs.copy(gjpushExecutableFilepath!, this.gjpushExecutable);
		await fs.chmod(this.gjpushExecutable, '0755');
	}

	/**
	 * Downloads the gjpush binary used to push the package and installers to GJ automatically.
	 */
	private async _downloadPrebuilt() {
		console.log('Downloading prebuilt gjpush executable');

		// Ensure our cache dir.
		await fs.mkdirp(path.resolve(this.config.cacheDir));

		// In prod we fetch the binary from the github releases page. It is
		// zipped on Github because we didn't want to have OS specific filenames
		// like gjpush-win32.exe so we distinguish the OS by the zip name which
		// then contains gjpush.exe for windows or just gjpush for mac/linux.
		let remoteExecutable = '';
		let localExecutable = '';
		switch (os.type()) {
			case 'Windows_NT':
				remoteExecutable = 'windows.zip';
				localExecutable = 'gjpush.exe';
				break;
			case 'Darwin':
				remoteExecutable = 'osx.zip';
				localExecutable = 'gjpush';
				break;
			case 'Linux':
				remoteExecutable = 'linux.zip';
				localExecutable = 'gjpush';
				break;
			default:
				throw new Error('Unsupported operating system');
		}

		const gjpushZip = path.resolve(this.config.cacheDir, 'gjpush.zip');

		await downloadFile(
			`https://github.com/gamejolt/cli/releases/download/${gjpushVersion}/${remoteExecutable}`,
			gjpushZip
		);

		await unzip(gjpushZip, this.config.cacheDir);
		await fs.rename(path.join(this.config.cacheDir, localExecutable), this.gjpushExecutable);

		// Ensure the gjpush binary is executable.
		await fs.chmod(this.gjpushExecutable, '0755');
	}

	/**
	 * Pushes the single package to GJ.
	 * Returns the build id that was just pushed.
	 */
	async push(options: { gameId: number; packageId: number; filepath: string }) {
		console.log('Pushing archive to Game Jolt');

		const gjpushToken = process.env.GJPUSH_TOKEN;
		if (!gjpushToken) {
			throw new Error('GJPUSH_TOKEN environment variable is not set');
		}

		// We trust the exit codes to tell us if something went wrong
		// because a non 0 exit code will make this throw.
		const gjPush = () =>
			runShell(this.gjpushExecutable, {
				args: [
					'--no-resume',
					'-g',
					options.gameId,
					'-p',
					options.packageId,
					'-r',
					packageJson.version,
					options.filepath,
				],
			});

		// Let's try to be resilient to network failures by trying a few times.
		await tryWithBackoff(gjPush, 3);

		return await this.getPackageBuildId(
			options.gameId,
			options.packageId,
			path.basename(options.filepath)
		);
	}

	async getPackageBuildId(gameId: number, packageId: number, expectedBasename: string) {
		// First step is getting the release ID matching the version we just
		// uploaded.
		const releasePayload = await this.sendServiceApiRequest(
			`/releases/by-version/${packageId}/${packageJson.version}`
		);

		// Then find the builds for that version.
		const buildPayload = await this.sendServiceApiRequest(
			`/releases/builds/${releasePayload.release.id}?game_id=${gameId}&package_id=${packageId}`
		);

		console.log(buildPayload);

		// The build matching the filename we just uploaded is the build ID
		// we're after.
		const build = buildPayload.builds.data.find(i => {
			const filename = (i?.file?.filename ?? '') as string;
			return filename.toLowerCase() === expectedBasename.toLowerCase();
		});

		if (!build) {
			throw new Error('Could not get build');
		}

		return build.id as number;
	}

	/**
	 * Function to issue an authenticated service API request and return the
	 * result as json.
	 */
	async sendServiceApiRequest(endpoint: string): Promise<any> {
		const gjpushToken = process.env.GJPUSH_TOKEN;
		if (!gjpushToken) {
			throw new Error('GJPUSH_TOKEN environment variable is not set');
		}

		const hostname =
			this.config.environment === 'development' ? 'development.gamejolt.com' : 'gamejolt.com';

		const requestOpts: RequestInit = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: gjpushToken,
			},
		};

		// Use self signed certificat when uploading to dev.
		if (this.config.environment === 'development') {
			const ca = await fs.readFile(
				path.resolve(__dirname, '..', '..', '..', 'gamejoltCA.crt')
			);
			requestOpts.agent = new https.Agent({ ca });
		}

		const response = await fetch(
			`https://${hostname}/service-api/push${endpoint}`,
			requestOpts
		);

		if (!response.ok) {
			throw new Error('Service api request failed');
		}

		return await response.json();
	}
}
