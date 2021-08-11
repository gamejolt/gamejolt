import { Emit, Options, Prop, Watch } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import AppCardListItem from '../../../../../_common/card/list/item/item.vue';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { filesize } from '../../../../../_common/filters/filesize';
import { fuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { number } from '../../../../../_common/filters/number';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import AppForm from '../../../../../_common/form-vue/form';
import { BaseForm, FormOnInit, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { GameBuildLaunchOption } from '../../../../../_common/game/build/launch-option/launch-option.model';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { GameRelease } from '../../../../../_common/game/release/release.model';
import { Growls } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import { AppProgressPoller } from '../../../../../_common/progress/poller/poller';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import FormGameReleaseTS from '../release/release';
import FormGameRelease from '../release/release.vue';
import { ArchiveFileSelectorModal } from './archive-file-selector-modal.service';

type GameBuildFormModel = GameBuild & {
	launch_windows: string;
	launch_windows_64: string;
	launch_mac: string;
	launch_mac_64: string;
	launch_linux: string;
	launch_linux_64: string;
	launch_other: string;
};

@Options({
	components: {
		AppCardListItem,
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
export default class FormGameBuild
	extends BaseForm<GameBuildFormModel>
	implements FormOnInit, FormOnLoad
{
	modelClass = GameBuild as any;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@Prop(Game)
	game!: Game;

	@Prop(GamePackage)
	package!: GamePackage;

	@Prop(GameRelease)
	release!: GameRelease;

	@Prop(Array)
	releaseLaunchOptions!: GameBuildLaunchOption[];

	@Prop(Object)
	buildDownloadCounts!: {
		[buildId: number]: number;
	};

	@Prop(Array)
	builds!: GameBuild[];

	private releaseForm!: FormGameReleaseTS;

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

	declare $refs: {
		form: AppForm;
	};

	@Emit('remove-build')
	emitRemoveBuild(_formModel: GameBuildFormModel) {}

	@Emit('update-launch-options')
	emitUpdateLaunchOptions(_formModel: GameBuildFormModel, _launchOptions: any) {}

	get loadUrl() {
		return `/web/dash/developer/games/builds/save/${this.game.id}/${this.package.id}/${
			this.release.id
		}/${this.model!.id}`;
	}

	get pollUrl() {
		return `/web/dash/developer/games/builds/poll-progress/${this.game.id}/${this.package.id}/${
			this.release.id
		}/${this.model!.id}`;
	}

	get shouldPollProgress() {
		return this.model && this.model.status === GameBuild.STATUS_ADDING && !this.archiveError;
	}

	get archiveError() {
		if (!this.model) {
			return '';
		}

		if (this.model.hasError(GameBuild.ERROR_INVALID_ARCHIVE)) {
			return this.$gettext(
				`The archive you uploaded looks corrupted, we can't extract it on our end.`
			);
		}

		if (this.model.hasError(GameBuild.ERROR_PASSWORD_ARCHIVE)) {
			return this.$gettext(`The archive you uploaded is password-protected.`);
		}

		if (this.model.hasError(GameBuild.ERROR_NOT_HTML_ARCHIVE)) {
			return this.$gettext(
				`The archive you uploaded doesn't look like a valid html build. We expect a zip with an index.html at the root of the archive.`
			);
		}

		return '';
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
			(this.model.type === GameBuild.TYPE_APPLET ||
				this.model.type === GameBuild.TYPE_SILVERLIGHT)
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

	get availablePlatformOptions() {
		if (!this.model) {
			return [];
		}

		return this.platformOptions.filter(platform => (this.model as any)[`os_${platform.key}`]);
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

	get isFitToScreen() {
		return this.formModel && this.formModel.embed_fit_to_screen;
	}

	created() {
		this.releaseForm = findRequiredVueParent(this, FormGameRelease) as FormGameReleaseTS;
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
		this.maxFilesize = payload.maxFilesize;
		this.restrictedPlatforms = payload.restrictedPlatforms;
		this.forceOther = payload.forceOther;
		this.romTypes = payload.romTypes;
	}

	remove() {
		this.emitRemoveBuild(this.model!);
	}

	// This is called by the release form.
	public save() {
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
			for (const _platform of GameBuildLaunchOption.LAUNCHABLE_PLATFORMS) {
				const key = 'os_' + _platform;

				// oh geez
				this.setField(key as any, (this.model as any)[key]);
			}

			// Copy new launch options in.
			this.emitUpdateLaunchOptions(this.model!, response.launchOptions);
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

		for (const launchOption of this.buildLaunchOptions) {
			this.setField(('launch_' + launchOption.os) as any, launchOption.executable_path);
		}

		this.prevCount = this.buildLaunchOptions.length;
	}

	@Watch('formModel.embed_width')
	@Watch('formModel.embed_height')
	@Watch('formModel.embed_fit_to_screen')
	onDimensionsChanged() {
		const hasError =
			this.isBrowserBased &&
			!this.isFitToScreen &&
			(!this.formModel.embed_width || !this.formModel.embed_height);

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

	processPollerResponse(response: any) {
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
