import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./migrator.html?style=./migrator.styl';
import {
	ClientLibraryStore,
	ClientLibraryState,
	ClientLibraryAction,
} from '../../../store/client-library';
import { State } from 'vuex-class';
import { LocalDbPackage } from '../local-db/package/package.model';
import * as fs from 'fs';
import * as path from 'path';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { sleep } from '../../../../lib/gj-lib-client/utils/utils';

// Constants for checking the current stage for resuming.
enum MigrationStage {
	NONE = 0,
	TMP_PATH = 1,
	INSTALL_DIR = 2,
	DATA_PATH = 3,
	ARCHIVE_FILE_LIST = 4,
	PATCH_FILE_LIST = 5,
}

const READ_MODE = (fs as any).R_OK;

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppClientMigrator extends Vue {
	@State clientLibrary: ClientLibraryStore;
	@ClientLibraryState isLocalDbReady: ClientLibraryStore['isLocalDbReady'];
	@ClientLibraryState isLauncherReady: ClientLibraryStore['isLauncherReady'];
	@ClientLibraryAction installerInit: ClientLibraryStore['installerInit'];

	isClosed = false;
	packagesToMigrate: LocalDbPackage[] = [];
	stage: 'running' | 'migrate' = 'running';
	runningPackages: LocalDbPackage[] = [];
	currentPackage: LocalDbPackage = null as any;
	currentIndex = 0;
	currentPackageResolve: Function = null as any;
	packageFailed = false;

	get progress() {
		return (this.currentIndex + 1) / this.packagesToMigrate.length * 100;
	}

	get packageTitle() {
		if (!this.currentPackage) {
			return '';
		}

		if (this.currentPackage.title) {
			return this.currentPackage.title;
		}

		const game = this.clientLibrary.gamesById[this.currentPackage.game_id];
		if (game) {
			return game.title;
		}

		return '';
	}

	created() {
		document.body.classList.add('client-migrate-no-overflow');
		console.log('test');
		if (this.isLocalDbReady || this.isLauncherReady) {
			this.checkPackages();
		}
	}

	@Watch('isLocalDbReady')
	onLocalDbReady() {
		if (!this.isLocalDbReady) {
			return;
		}

		console.log('Localdb ready!');
		this.checkPackages();
	}

	@Watch('isLauncherReady')
	onLauncherReady() {
		if (!this.isLauncherReady) {
			return;
		}

		console.log('Launcher ready!');
		this.checkPackages();
	}

	/**
	 * Find the packages that need to be migrated. Once all packages are
	 * migrated we no longer have to migrate ever.
	 */
	async checkPackages() {
		if (this.isClosed) {
			return;
		}

		if (!this.isLocalDbReady) {
			return;
		}

		console.log('Getting packages to migrate');
		this.packagesToMigrate = this.getPackagesToMigrate();
		if (!this.packagesToMigrate) {
			console.log('No packages to migrate');
			return this.close();
		}

		// Wait until the launcher is loaded to check running so that the
		// data is correctly loaded in.
		if (!this.isLauncherReady) {
			return;
		}

		console.log('Migrating packages', this.packagesToMigrate);
		this.checkRunning();
	}

	/**
	 * We can't migrate until all packages have stopped running. This checks
	 * that.
	 */
	async checkRunning() {
		this.runningPackages = this.packagesToMigrate.filter(localPackage => localPackage.isRunning);
		console.log('running packages', this.runningPackages);

		if (this.runningPackages.length) {
			await new Promise(resolve => {
				this.$watch('clientLibrary.runningPackageIds', (runningPackageIds: number[]) => {
					console.log('Number of running games: ' + runningPackageIds.length);
					this.runningPackages = this.runningPackages.filter(
						localPackage => runningPackageIds.indexOf(localPackage.id) !== -1
					);

					console.log('Number of running games to migrate: ' + this.runningPackages.length);
					if (!this.runningPackages.length) {
						resolve();
					}
				});
			});
		}

		this.migrate();
	}

	async migrate() {
		console.log('Begin migration.');
		this.stage = 'migrate';
		for (let i = 0; i < this.packagesToMigrate.length; i++) {
			this.currentIndex = i;
			this.currentPackage = this.packagesToMigrate[this.currentIndex];
			this.packageFailed = false;

			const migratePromise = new Promise<void>(resolve => (this.currentPackageResolve = resolve));
			this.tryMigratePackage();
			await migratePromise;
		}

		console.log('No more packages to migrate.');
		this.installerInit();

		this.close();
	}

	tryMigratePackage() {
		try {
			this.doMigratePackage(this.currentPackage);
			this.currentPackageResolve();
		} catch (e) {
			this.packageFailed = true;
			console.error(e);
		}
	}

	/**
	 * Will retry to migrate the current package.
	 */
	async retry() {
		// Since retrying is usually so fast that angular doesn't update the
		// view in time, we want to wait before actually trying so that the
		// message goes away and then appears again. Otherwise it looks like
		// the button is broken.
		this.packageFailed = false;
		await sleep(100);
		this.tryMigratePackage();
	}

	/**
	 * Uninstalls the current package rather than processing it.
	 */
	async uninstall() {
		if (!this.currentPackage || !this.currentPackageResolve) {
			return;
		}

		try {
			await this.currentPackage.uninstall(false);
			this.currentPackageResolve();
		} catch (err) {
			console.error('Failed to uninstall package');
			console.error(err);

			this.packageFailed = true;
		}
	}

	/**
	 * Hide the migrate process/modal.
	 */
	close() {
		document.body.classList.remove('client-migrate-no-overflow');
		this.isClosed = true;
	}

	getPackagesToMigrate() {
		const packagesToMigrate = [];

		for (let localPackage of this.clientLibrary.packages) {
			const manifestPath = path.join(localPackage.install_dir, '.manifest');
			try {
				fs.accessSync(manifestPath, READ_MODE);
			} catch (e) {
				packagesToMigrate.push(localPackage);
			}
		}

		return packagesToMigrate;
	}

	doMigratePackage(localPackage: LocalDbPackage) {
		console.log('Migrating package: ', localPackage.id);

		const basename = path.basename(localPackage.install_dir);
		const dirname = path.dirname(localPackage.install_dir);
		const tmpPath = path.join(dirname, '_migrate-' + basename);
		const newDataPath = path.join(localPackage.install_dir, 'data');

		// STAGE CHECKS

		// Go backwards through the steps to find the stage. This way we find
		// what was last done.
		let stage = MigrationStage.NONE;

		try {
			// The archive file list is outside the data folder and the data folder exists.
			fs.accessSync(path.join(localPackage.install_dir, '.gj-archive-file-list'), READ_MODE);
			fs.accessSync(newDataPath, READ_MODE);
			stage = MigrationStage.ARCHIVE_FILE_LIST;
		} catch (e) {}

		if (stage === MigrationStage.NONE) {
			try {
				fs.accessSync(newDataPath, READ_MODE);
				stage = MigrationStage.DATA_PATH;
			} catch (e) {}
		}

		if (stage === MigrationStage.NONE) {
			try {
				// The install dir is there and the tmp path is there.
				fs.accessSync(tmpPath, READ_MODE);
				fs.accessSync(localPackage.install_dir, READ_MODE);
				stage = MigrationStage.INSTALL_DIR;
			} catch (e) {}
		}

		if (stage === MigrationStage.NONE) {
			try {
				fs.accessSync(tmpPath, READ_MODE);
				stage = MigrationStage.TMP_PATH;
			} catch (e) {}
		}

		if (stage !== MigrationStage.NONE) {
			console.log('Resuming from stage: ', stage);
		}

		// DO STAGES

		// Creation of tmp folder for data.
		if (stage < MigrationStage.TMP_PATH) {
			console.log('Rename install dir.', localPackage.install_dir, tmpPath);
			fs.renameSync(localPackage.install_dir, tmpPath);
		}

		// Create the new folder for the data/manifest.
		if (stage < MigrationStage.INSTALL_DIR) {
			console.log('Make install dir.', localPackage.install_dir);
			fs.mkdirSync(localPackage.install_dir);
		}

		// Move the tmp folder into the new package folder with the name "data."
		if (stage < MigrationStage.DATA_PATH) {
			console.log('Move tmp path to data path.', tmpPath, newDataPath);
			fs.renameSync(tmpPath, newDataPath);
		}

		// Pull the old archive file list file into the top level.
		if (stage < MigrationStage.ARCHIVE_FILE_LIST) {
			console.log('Move archive file list.');
			fs.renameSync(
				path.join(newDataPath, '.gj-archive-file-list'),
				path.join(localPackage.install_dir, '.gj-archive-file-list')
			);
		}

		// Pull the old patch file list file into the top level. It may not exist.
		let exists = false;
		try {
			const stats = fs.lstatSync(path.join(newDataPath, '.gj-patch-file'));
			exists = stats.isFile() && !stats.isSymbolicLink();
		} catch (e) {}

		if (exists) {
			fs.renameSync(
				path.join(newDataPath, '.gj-patch-file'),
				path.join(localPackage.install_dir, '.gj-patch-file')
			);
		}

		// Pull the temp download file into the top level. It may not exist.
		exists = false;
		try {
			const stats = fs.lstatSync(path.join(newDataPath, '.gj-tempDownload'));
			exists = stats.isFile() && !stats.isSymbolicLink();
		} catch (e) {}

		if (exists) {
			fs.renameSync(
				path.join(newDataPath, '.gj-tempDownload'),
				path.join(localPackage.install_dir, '.tempDownload')
			);
		}

		// It's fine to rebuild the manifest. No need for stage checks.
		const fileList = fs.readFileSync(
			path.join(localPackage.install_dir, '.gj-archive-file-list'),
			'utf8'
		);
		const lines = fileList
			.split('\n')
			.map(line => line.trim())
			// Make sure that empty lines are discarded.
			.filter(line => !!line);

		// If the patch file exists in the top level, rebuild the manifest using it as the patch info dynamic files.
		exists = false;
		try {
			const stats = fs.lstatSync(path.join(localPackage.install_dir, '.gj-patch-file'));
			exists = stats.isFile() && !stats.isSymbolicLink();
		} catch (e) {}

		let patchLines = undefined;
		if (exists) {
			patchLines = fs
				.readFileSync(path.join(localPackage.install_dir, '.gj-patch-file'), 'utf8')
				.split('\n')
				.map(line => line.trim())
				// Make sure that empty lines are discarded.
				.filter(line => !!line);
		}

		const manifestData = this.generateManifest(localPackage, lines, patchLines);

		fs.writeFileSync(
			path.join(localPackage.install_dir, '.manifest'),
			JSON.stringify(manifestData)
		);
	}

	generateManifest(localPackage: LocalDbPackage, fileList: string[], patchList?: string[]) {
		const launchOption = this.findLaunchOption(localPackage);
		if (!launchOption) {
			throw new Error(
				`Package doesn't have any launch option matching this system. How was it installed in the first place?`
			);
		}

		const manifest = {
			version: 1,
			gameInfo: {
				dir: 'data',
				uid: localPackage.id + '-' + localPackage.build.id,
				archiveFiles: fileList,
			},
			launchOptions: {
				executable: launchOption.executable_path ? launchOption.executable_path : fileList[0],
			},
			os: Device.os(),
			arch: Device.arch(),
			isFirstInstall: false,
		};

		if (localPackage.isUpdating) {
			const patchInfo = {
				dir: 'data',
				uid: localPackage.update!.id + '-' + localPackage.update!.build.id,
				isDirty: !!patchList,
			};

			if (patchList) {
				(patchInfo as any).dynamicFiles = patchList;
			}

			(manifest as any).patchInfo = patchInfo;
		}

		return manifest;
	}

	findLaunchOption(localPackage: LocalDbPackage) {
		const os = Device.os();
		const arch = Device.arch();

		let result = undefined;
		for (let launchOption of localPackage.launch_options) {
			let lOs: (string | null)[] = launchOption.os ? launchOption.os.split('_') : [];
			if (lOs.length === 0) {
				lOs = [null, '32'];
			} else if (lOs.length === 1) {
				lOs.push('32');
			}

			if (lOs[0] === os) {
				if (lOs[1] === arch) {
					return launchOption;
				}
				result = launchOption;
			} else if (lOs[0] === null && !result) {
				result = launchOption;
			}
		}

		return result;
	}
}
