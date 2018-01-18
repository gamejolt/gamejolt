import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./build.html?style=./build.styl';

import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../../lib/gj-lib-client/components/game/release/release.model';
import { GameBuildLaunchOption } from '../../../../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ArchiveFileSelectorModal } from './archive-file-selector-modal.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { filesize } from '../../../../../lib/gj-lib-client/vue/filters/filesize';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppProgressPoller } from '../../../../../lib/gj-lib-client/components/progress/poller/poller';
import { AppProgressBar } from '../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppLoading } from '../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { FormGameRelease } from '../release/release';
import { findRequiredVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { fuzzynumber } from '../../../../../lib/gj-lib-client/vue/filters/fuzzynumber';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { AppCardListItem } from '../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';

type GameBuildFormModel = GameBuild & {
	launch_windows: string;
	launch_windows_64: string;
	launch_mac: string;
	launch_mac_64: string;
	launch_linux: string;
	launch_linux_64: string;
	launch_other: string;
};

@View
@Component({
	components: {
		AppCardListItem,
		AppJolticon,
		AppExpand,
		AppProgressPoller,
		AppProgressBar,
		AppLoading,
		AppFormControlToggle,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		fuzzynumber,
		filesize,
	},
})
export class FormGameBuild extends BaseForm<GameBuildFormModel> implements FormOnInit, FormOnLoad {
	modelClass = GameBuild as any;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(GameRelease) release: GameRelease;
	@Prop(Array) releaseLaunchOptions: GameBuildLaunchOption[];
	@Prop(Object) buildDownloadCounts: { [buildId: number]: number };
	@Prop(Array) builds: GameBuild[];

	private releaseForm: FormGameRelease;

	maxFilesize = 0;
	restrictedPlatforms: string[] = [];
	forceOther = false;
	romTypes: string[] = [];
	isSettingPlatform = false;
	prevCount = -1;
	buildLaunchOptions: GameBuildLaunchOption[] = [];
	wasChanged = false;

	readonly number = number;
	readonly GameBuild = GameBuild;

	$refs: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/dash/developer/games/builds/save/${this.game.id}/${this.package.id}/${
			this.release.id
		}/${this.model!.id}`;
	}

	get hasBrowserError() {
		return this.hasCustomError('browser');
	}

	get isBrowserBased() {
		return this.model!.isBrowserBased;
	}

	get hasPlatformsError() {
		return this.hasCustomError('platforms');
	}

	get isDeprecated() {
		return (
			this.model &&
			(this.model.type === GameBuild.TYPE_APPLET || this.model.type === GameBuild.TYPE_SILVERLIGHT)
		);
	}

	get platformOptions() {
		return [
			{
				key: 'windows',
				label: this.$gettext('dash.games.builds.form.windows_tag'),
				icon: 'windows',
			},
			{
				key: 'windows_64',
				label: this.$gettext('dash.games.builds.form.windows_64_tag'),
				icon: 'windows',
			},
			{
				key: 'mac',
				label: this.$gettext('dash.games.builds.form.mac_tag'),
				icon: 'mac',
			},
			{
				key: 'mac_64',
				label: this.$gettext('dash.games.builds.form.mac_64_tag'),
				icon: 'mac',
			},
			{
				key: 'linux',
				label: this.$gettext('dash.games.builds.form.linux_tag'),
				icon: 'linux',
			},
			{
				key: 'linux_64',
				label: this.$gettext('dash.games.builds.form.linux_64_tag'),
				icon: 'linux',
			},
			{
				key: 'other',
				label: this.$gettext('dash.games.builds.form.other_tag'),
				icon: 'other-os',
			},
		];
	}

	get platformsValid() {
		if (!this.model) {
			return false;
		}

		if (this.model.type !== GameBuild.TYPE_DOWNLOADABLE) {
			return true;
		}

		return (
			!!this.model.os_windows ||
			!!this.model.os_mac ||
			!!this.model.os_linux ||
			!!this.model.os_windows_64 ||
			!!this.model.os_mac_64 ||
			!!this.model.os_linux_64 ||
			!!this.model.os_other
		);
	}

	get emulatorsInfo(): { [type: string]: string } {
		return {
			[GameBuild.EMULATOR_GB]: this.$gettext('Game Boy'),
			[GameBuild.EMULATOR_GBC]: this.$gettext('Game Boy Color'),
			[GameBuild.EMULATOR_GBA]: this.$gettext('Game Boy Advance'),
			[GameBuild.EMULATOR_NES]: this.$gettext('NES'),
			[GameBuild.EMULATOR_SNES]: this.$gettext('SNES'),
			[GameBuild.EMULATOR_VBOY]: this.$gettext('Virtual Boy'),
			[GameBuild.EMULATOR_GENESIS]: this.$gettext('Genesis/Mega Drive'),
			[GameBuild.EMULATOR_ATARI2600]: this.$gettext('Atari 2600'),
			[GameBuild.EMULATOR_ZX]: this.$gettext('ZX Spectrum'),
			[GameBuild.EMULATOR_C64]: this.$gettext('Commodore 64'),
			[GameBuild.EMULATOR_CPC]: this.$gettext('Amstrad CPC'),
			[GameBuild.EMULATOR_MSX]: this.$gettext('MSX'),
		};
	}

	created() {
		this.releaseForm = findRequiredVueParent(this, FormGameRelease);
		this.releaseForm.buildForms.push(this);
	}

	beforeDestroy() {
		arrayRemove(this.releaseForm.buildForms, buildForm => buildForm === this);
	}

	onInit() {
		this.maxFilesize = 0;
		this.restrictedPlatforms = [];
		this.forceOther = false;
		this.romTypes = [];
		this.isSettingPlatform = false;
		this.prevCount = -1;
		this.buildLaunchOptions = [];
		this.wasChanged = false;

		// This populates buildLaunchOptions for the first time.
		this.onReleaseLaunchOptionsChanged();
		this.validatePlatforms();
	}

	onLoad(payload: any) {
		console.log(payload);
		this.maxFilesize = payload.maxFilesize;
		this.restrictedPlatforms = payload.restrictedPlatforms;
		this.forceOther = payload.forceOther;
		this.romTypes = payload.romTypes;
	}

	remove() {
		this.$emit('remove-build', this.model);
	}

	save() {
		return this.$refs.form.submit();
	}

	isPlatformDisabled(platform: string) {
		// Restricted by server.
		if (this.restrictedPlatforms && Array.isArray(this.restrictedPlatforms)) {
			if (this.restrictedPlatforms.indexOf(platform) !== -1) {
				return true;
			}
		}

		// Can only be other OR a platform.
		if (platform !== 'other' && this.model!.os_other) {
			return true;
		} else if (
			platform === 'other' &&
			(this.model!.os_windows ||
				this.model!.os_mac ||
				this.model!.os_linux ||
				this.model!.os_windows_64 ||
				this.model!.os_mac_64 ||
				this.model!.os_linux_64)
		) {
			return true;
		}

		// Can't choose a platform chosen by another build in this package.
		if (platform !== 'other') {
			const foundBuild = this.builds.find(value => (value as any)[`os_${platform}`] === true);
			if (foundBuild && foundBuild.id !== this.model!.id) {
				return true;
			}
		}

		return false;
	}

	async platformChanged(platform: string) {
		this.isSettingPlatform = true;

		try {
			const params = [
				this.game.id,
				this.package.id,
				this.release.id,
				this.model!.id,
				platform,
				(this.formModel as any)['os_' + platform] ? 1 : 0,
			];

			const response = await Api.sendRequest(
				'/web/dash/developer/games/builds/set-platform/' + params.join('/'),
				{},
				{ detach: true }
			);

			this.model!.assign(response.gameBuild);
			this.game.assign(response.game);

			// Copy new platforms to the form model.
			for (let _platform of GameBuildLaunchOption.LAUNCHABLE_PLATFORMS) {
				const key = 'os_' + _platform;

				// oh geez
				this.setField(key as any, (this.model as any)[key]);
			}

			// Copy new launch options in.
			this.$emit('update-launch-options', this.model, response.launchOptions);
		} catch (err) {
			console.error(err);
			Growls.error(this.$gettext('Could not set the platform for some reason.'));
		} finally {
			this.isSettingPlatform = false;
		}

		this.validatePlatforms();
	}

	private validatePlatforms() {
		if (!this.platformsValid) {
			this.setCustomError('platforms');
		} else {
			this.clearCustomError('platforms');
		}
	}

	getExecutablePath(platform: string) {
		return (this.formModel as any)['launch_' + platform];
	}

	@Watch('releaseLaunchOptions')
	onReleaseLaunchOptionsChanged() {
		this.buildLaunchOptions = this.releaseLaunchOptions.filter(
			launchOption => launchOption.game_build_id === this.model!.id
		);

		if (this.prevCount === -1) {
			this.prevCount = this.buildLaunchOptions.length;
		}

		for (let launchOption of this.buildLaunchOptions) {
			this.setField(('launch_' + launchOption.os) as any, launchOption.executable_path);
		}

		this.prevCount = this.buildLaunchOptions.length;
	}

	@Watch('formModel.embed_width')
	@Watch('formModel.embed_height')
	onDimensionsChanged() {
		const hasError =
			this.isBrowserBased && (!this.formModel.embed_width || !this.formModel.embed_height);

		if (hasError) {
			this.setCustomError('browser');
		} else {
			this.clearCustomError('browser');
		}
	}

	async openFileSelector(platform: string) {
		const selected = await ArchiveFileSelectorModal.show(
			this.game.id,
			this.package.id,
			this.release.id,
			this.model!.id,
			this.model!.primary_file.id,
			platform
		);

		if (!selected) {
			return;
		}

		this.setField(('launch_' + platform) as any, selected);
		this.onBuildFieldChanged();
	}

	onBuildProcessingComplete(response: any) {
		// Just copy over the new build data into our current one.
		this.model!.assign(response.build);
		if (response.game) {
			this.game.assign(response.game);
		}
	}

	/**
	 * Must be called any time a field changes that we need to show the save
	 * button for.
	 */
	onBuildFieldChanged() {
		this.wasChanged = true;
	}

	onSubmitSuccess(response: any) {
		if (this.game) {
			this.game.assign(response.game);
		}
	}
}

// angular
// 	.module('App.Forms.Dashboard')
// 	.directive('gjFormDashboardGameBuild', function(
// 		$q,
// 		$modal,
// 		Form,
// 		Api,
// 		Game_Package,
// 		Game_Release,
// 		Game_Build,
// 		Game_Build_File,
// 		Game_Build_LaunchOption,
// 		Growls,
// 		gettextCatalog,
// 		$timeout
// 	) {
// 		var form = new Form({
// 			model: 'Game_Build',
// 			template: require('./build.html'),
// 			resetOnSubmit: true,
// 		});

// 		form.scope.game = '=gjGame';
// 		form.scope.package = '=gjGamePackage';
// 		form.scope.release = '=gjGameRelease';
// 		form.scope.releaseLaunchOptions = '=?gjGameLaunchOptions';
// 		form.scope.onRemoveBuild = '&gjOnRemoveBuild';
// 		form.scope.updateLaunchOptions = '&gjUpdateLaunchOptions';
// 		form.scope.buildDownloadCounts = '=gjBuildDownloadCounts';
// 		form.scope.packageBuilds = '=gjGamePackageBuilds'; // All builds for the package.

// 		form.require = '^gjFormDashboardGameRelease';

// 		// We store all the build forms into the game release form.
// 		// This way when the release is saved, the builds can all be saved as well.
// 		var oldPost = form.link.post;
// 		form.link.post = function(scope, element, attrs, releaseForm) {
// 			releaseForm.buildForms[scope.baseModel.id] = {
// 				form: form,
// 				scope: scope,
// 			};

// 			scope.$on('$destroy', function() {
// 				delete releaseForm.buildForms[scope.baseModel.id];
// 			});

// 			// In case the Form API changes and uses a post link func.
// 			if (oldPost) {
// 				oldPost();
// 			}
// 		};

// 		form.onInit = function(scope) {
// 			scope.Game_Build = Game_Build;

// 			setupLaunchOptions(scope);
// 			setupDownloadablePlatforms(scope);
// 			setupEmulators(scope);
// 			setupStatusPolling(scope);
// 			setupChangedWatching(scope);

// 			scope.isDeprecated =
// 				scope.baseModel.type === Game_Build.TYPE_APPLET ||
// 				scope.baseModel.type === Game_Build.TYPE_SILVERLIGHT;

// 			if (!scope.isLoaded) {
// 				var params = [scope.game.id, scope.package.id, scope.release.id, scope.baseModel.id];

// 				Api.sendRequest('/web/dash/developer/games/builds/save/' + params.join('/')).then(function(
// 					payload
// 				) {
// 					scope.isLoaded = true;
// 					angular.extend(scope, payload);
// 				});
// 			}

// 			scope.remove = function() {
// 				scope.onRemoveBuild({ $build: scope.baseModel });
// 			};
// 		};

// 		function setupDownloadablePlatforms(scope) {
// 			scope.platformsInfo = {
// 				windows: {
// 					icon: 'windows',
// 					label: gettextCatalog.getString('dash.games.releases.builds.windows_tag'),
// 				},
// 				windows_64: {
// 					icon: 'windows',
// 					label: gettextCatalog.getString('dash.games.releases.builds.windows_64_tag'),
// 				},
// 				mac: {
// 					icon: 'mac',
// 					label: gettextCatalog.getString('dash.games.releases.builds.mac_tag'),
// 				},
// 				mac_64: {
// 					icon: 'mac',
// 					label: gettextCatalog.getString('dash.games.releases.builds.mac_64_tag'),
// 				},
// 				linux: {
// 					icon: 'linux',
// 					label: gettextCatalog.getString('dash.games.releases.builds.linux_tag'),
// 				},
// 				linux_64: {
// 					icon: 'linux',
// 					label: gettextCatalog.getString('dash.games.releases.builds.linux_64_tag'),
// 				},
// 				other: {
// 					icon: 'other-os',
// 					label: gettextCatalog.getString('dash.games.releases.builds.other_tag'),
// 				},
// 			};

// 			scope.platformOptions = [
// 				{
// 					key: 'windows',
// 					label: gettextCatalog.getString('dash.games.builds.form.windows_tag'),
// 					icon: 'windows',
// 				},
// 				{
// 					key: 'windows_64',
// 					label: gettextCatalog.getString('dash.games.builds.form.windows_64_tag'),
// 					icon: 'windows',
// 				},
// 				{
// 					key: 'mac',
// 					label: gettextCatalog.getString('dash.games.builds.form.mac_tag'),
// 					icon: 'mac',
// 				},
// 				{
// 					key: 'mac_64',
// 					label: gettextCatalog.getString('dash.games.builds.form.mac_64_tag'),
// 					icon: 'mac',
// 				},
// 				{
// 					key: 'linux',
// 					label: gettextCatalog.getString('dash.games.builds.form.linux_tag'),
// 					icon: 'linux',
// 				},
// 				{
// 					key: 'linux_64',
// 					label: gettextCatalog.getString('dash.games.builds.form.linux_64_tag'),
// 					icon: 'linux',
// 				},
// 				{
// 					key: 'other',
// 					label: gettextCatalog.getString('dash.games.builds.form.other_tag'),
// 					icon: 'other-os',
// 				},
// 			];

// 			scope.isPlatformDisabled = function(platform) {
// 				// Restricted by server.
// 				if (scope.restrictedPlatforms && angular.isArray(scope.restrictedPlatforms)) {
// 					if (scope.restrictedPlatforms.indexOf(platform) !== -1) {
// 						return true;
// 					}
// 				}

// 				// Can only be other OR a platform.
// 				if (platform !== 'other' && scope.baseModel.os_other) {
// 					return true;
// 				} else if (
// 					platform === 'other' &&
// 					(scope.baseModel.os_windows ||
// 						scope.baseModel.os_mac ||
// 						scope.baseModel.os_linux ||
// 						scope.baseModel.os_windows_64 ||
// 						scope.baseModel.os_mac_64 ||
// 						scope.baseModel.os_linux_64)
// 				) {
// 					return true;
// 				}

// 				// Can't choose a platform chosen by another build in this package.
// 				if (platform !== 'other') {
// 					var search = {};
// 					search['os_' + platform] = true;
// 					var foundBuild = _.find(scope.packageBuilds, search);
// 					if (foundBuild && foundBuild.id !== scope.baseModel.id) {
// 						return true;
// 					}
// 				}

// 				return false;
// 			};

// 			scope.platformChanged = function(platform) {
// 				scope.formState.isSettingPlatform = true;

// 				var val = scope.formModel['os_' + platform] ? 1 : 0;
// 				var params = [
// 					scope.game.id,
// 					scope.package.id,
// 					scope.release.id,
// 					scope.baseModel.id,
// 					platform,
// 					val,
// 				];
// 				return Api.sendRequest(
// 					'/web/dash/developer/games/builds/set-platform/' + params.join('/'),
// 					{},
// 					{ detach: true }
// 				)
// 					.then(function(response) {
// 						scope.baseModel.assign(new Game_Build(response.gameBuild));
// 						scope.game.assign(response.game);

// 						// Copy new platforms to the form model.
// 						for (var platform in scope.platformsInfo) {
// 							var key = 'os_' + platform;
// 							scope.formModel[key] = scope.baseModel[key];
// 						}

// 						// Copy new launch options in.
// 						scope.updateLaunchOptions({
// 							$build: scope.baseModel,
// 							$launchOptions: response.launchOptions,
// 						});

// 						scope.formState.isSettingPlatform = false;
// 					})
// 					.catch(function() {
// 						Growls.error(gettextCatalog.getString('Could not set the platform for some reason.'));
// 						scope.formState.isSettingPlatform = false;
// 					});
// 			};
// 		}

// 		function setupEmulators(scope) {
// 			scope.emulatorInfo = {};
// 			scope.emulatorInfo[Game_Build.EMULATOR_GB] = gettextCatalog.getString('Game Boy');
// 			scope.emulatorInfo[Game_Build.EMULATOR_GBC] = gettextCatalog.getString('Game Boy Color');
// 			scope.emulatorInfo[Game_Build.EMULATOR_GBA] = gettextCatalog.getString('Game Boy Advance');
// 			scope.emulatorInfo[Game_Build.EMULATOR_NES] = gettextCatalog.getString('NES');
// 			scope.emulatorInfo[Game_Build.EMULATOR_SNES] = gettextCatalog.getString('SNES');
// 			scope.emulatorInfo[Game_Build.EMULATOR_VBOY] = gettextCatalog.getString('Virtual Boy');
// 			scope.emulatorInfo[Game_Build.EMULATOR_GENESIS] = gettextCatalog.getString(
// 				'Genesis/Mega Drive'
// 			);
// 			scope.emulatorInfo[Game_Build.EMULATOR_ATARI2600] = gettextCatalog.getString('Atari 2600');
// 			scope.emulatorInfo[Game_Build.EMULATOR_ZX] = gettextCatalog.getString('ZX Spectrum');
// 			scope.emulatorInfo[Game_Build.EMULATOR_C64] = gettextCatalog.getString('Commodore 64');
// 			scope.emulatorInfo[Game_Build.EMULATOR_CPC] = gettextCatalog.getString('Amstrad CPC');
// 			scope.emulatorInfo[Game_Build.EMULATOR_MSX] = gettextCatalog.getString('MSX');
// 		}

// 		function setupLaunchOptions(scope) {
// 			var prevCount = undefined;
// 			scope.$watchCollection('releaseLaunchOptions', function(releaseLaunchOptions) {
// 				scope.buildLaunchOptions = _.where(releaseLaunchOptions, {
// 					game_build_id: scope.baseModel.id,
// 				});

// 				if (angular.isUndefined(prevCount)) {
// 					prevCount = scope.buildLaunchOptions.length;
// 				}

// 				scope.buildLaunchOptions.forEach(function(launchOption) {
// 					scope.formModel['launch_' + launchOption.os] = launchOption.executable_path;
// 				});

// 				// This will skip a single cycle of checking if the form fields have changed.
// 				// This is so that we don't get the "save build" button when adding a new launch option in after selecting new platform.
// 				// Only if we add, not if we remove.
// 				if (scope.buildLaunchOptions.length > prevCount) {
// 					scope.skipChangedWatch = true;
// 				}

// 				prevCount = scope.buildLaunchOptions.length;
// 			});

// 			var platformToFill;
// 			scope.openFileSelector = function(_platformToFill) {
// 				platformToFill = _platformToFill;

// 				var modalInstance = $modal.open({
// 					size: 'md',
// 					template: require('!html-loader!./archive-file-selector.html'),
// 					controller: 'Forms_Dashboard_Game_Build_ArchiveFileSelectorCtrl',
// 					controllerAs: 'modalCtrl',
// 					resolve: {
// 						data: function() {
// 							return {
// 								game: scope.game,
// 								package: scope.package,
// 								release: scope.release,
// 								build: scope.baseModel,
// 								platform: platformToFill,
// 							};
// 						},
// 					},
// 				});

// 				modalInstance.result.then(function(selected) {
// 					scope.formModel['launch_' + platformToFill] = selected;
// 					platformToFill = null;
// 				});
// 			};
// 		}

// 		function setupStatusPolling(scope) {
// 			scope.onBuildProcessingComplete = function(response) {
// 				// Just copy over the new build data into our current one.
// 				scope.baseModel.assign(response.build);
// 				if (response.game) {
// 					scope.game.assign(response.game);
// 				}
// 			};
// 		}

// 		function setupChangedWatching(scope) {
// 			scope.wasChanged = false;

// 			// Fields that require a build save before they take affect.
// 			var watchFields = [
// 				'formModel.embed_width',
// 				'formModel.embed_height',
// 				'formModel.browser_disable_right_click',
// 			];

// 			Game_Build_LaunchOption.LAUNCHABLE_PLATFORMS.forEach(function(os) {
// 				watchFields.push('formModel.launch_' + os);
// 			});

// 			scope.$watchGroup(watchFields, function(newVals, oldVals) {
// 				if (scope.skipChangedWatch) {
// 					scope.skipChangedWatch = false;
// 					return;
// 				}

// 				// Skip the initial watch.
// 				if (angular.equals(newVals, oldVals)) {
// 					return;
// 				}

// 				scope.wasChanged = true;
// 			});
// 		}

// 		form.onSubmitSuccess = function(scope, response) {
// 			if (scope.game) {
// 				scope.game.assign(response.game);
// 			}
// 		};

// 		return form;
// 	});
