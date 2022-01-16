<script lang="ts">
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import AppCardListItem from '../../../../../_common/card/list/item/item.vue';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../../_common/filters/number';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { GameBuildLaunchOption } from '../../../../../_common/game/build/launch-option/launch-option.model';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { GameRelease } from '../../../../../_common/game/release/release.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
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

class Wrapper extends BaseForm<GameBuildFormModel> {}

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
})
export default class FormGameBuild extends mixins(Wrapper) implements FormOnLoad {
	modelClass = GameBuild as any;

	@Prop(Object)
	game!: Game;

	@Prop(Object)
	package!: GamePackage;

	@Prop(Object)
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

	readonly formatNumber = formatNumber;
	readonly formatFuzzynumber = formatFuzzynumber;
	readonly formatFilesize = formatFilesize;
	readonly GameBuild = GameBuild;

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
		this.form.reloadOnSubmit = true;

		this.releaseForm = findRequiredVueParent(this, FormGameRelease) as FormGameReleaseTS;
		this.releaseForm.buildForms.push(this);
	}

	beforeUnmount() {
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
		return this.form.submit();
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
			showErrorGrowl(this.$gettext('Could not set the platform for some reason.'));
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

	@Watch('releaseLaunchOptions', { deep: true })
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
</script>

<template>
	<app-card-list-item class="game-build-form" :force-active="true">
		<a class="card-remove" @click="remove()">
			<app-jolticon icon="remove" />
		</a>

		<div class="card-stats">
			<div class="stat-big stat-big-smaller">
				<div class="stat-big-label">
					<translate>dash.games.releases.builds.downloads_label</translate>
				</div>
				<div
					class="stat-big-digit"
					:title="formatNumber(buildDownloadCounts[model.id] || 0)"
				>
					{{ formatNumber(buildDownloadCounts[model.id] || 0) }}
				</div>
			</div>
		</div>

		<div class="card-title">
			<h5>
				{{ model.primary_file.filename }}
				<small class="text-muted"
					>({{ formatFilesize(model.primary_file.filesize) }})</small
				>
			</h5>
		</div>

		<div class="card-meta">
			<span v-if="model.type === GameBuild.TYPE_DOWNLOADABLE" class="tag">
				<app-jolticon icon="download" />
				<translate>Downloadable</translate>
			</span>
			<span v-else-if="model.type === GameBuild.TYPE_HTML" class="tag">
				<app-jolticon icon="html5" />
				<translate>games.browser_html</translate>
			</span>
			<span v-else-if="model.type === GameBuild.TYPE_FLASH" class="tag">
				<app-jolticon icon="flash" />
				<translate>games.browser_flash</translate>
			</span>
			<span v-else-if="model.type === GameBuild.TYPE_UNITY" class="tag">
				<app-jolticon icon="unity" />
				<translate>games.browser_unity</translate>
			</span>
			<span v-else-if="model.type === GameBuild.TYPE_SILVERLIGHT" class="tag">
				<app-jolticon icon="silverlight" />
				<translate>games.browser_silverlight</translate>
			</span>
			<span v-else-if="model.type === GameBuild.TYPE_APPLET" class="tag">
				<app-jolticon icon="java" />
				<translate>games.browser_applet</translate>
			</span>
			<span v-else-if="model.type === GameBuild.TYPE_ROM" class="tag">
				<app-jolticon icon="rom" />
				<translate>ROM</translate>
			</span>

			<!--
				Missing fields.
			-->
			<span v-if="model.hasError(GameBuild.ERROR_MISSING_FIELDS)" class="tag tag-notice">
				<app-jolticon icon="notice" />
				<translate>Incomplete</translate>
			</span>

			<span v-else>
				<span v-if="model.status === GameBuild.STATUS_ADDING" class="tag">
					<translate>Processing</translate>
				</span>
				<span
					v-else-if="model.status === GameBuild.STATUS_ACTIVE"
					class="tag tag-highlight"
				>
					<app-jolticon icon="check" />
					<translate>Active</translate>
				</span>
			</span>
		</div>

		<!--
			Processing the build.
		-->
		<template v-if="shouldPollProgress">
			<app-progress-poller
				:url="pollUrl"
				@progress="processPollerResponse"
				@complete="processPollerResponse"
			/>

			<app-expand :when="!model.errors">
				<br />
				<app-progress-bar thin indeterminate active :percent="100" />

				<div v-translate class="text-center small">
					<strong>Processing build.</strong>
					It will become available in this release as soon as we're done.
				</div>
			</app-expand>
		</template>

		<template #body>
			<app-form :controller="form">
				<div
					v-if="model.type === GameBuild.TYPE_APPLET"
					class="alert alert-notice sans-margin"
				>
					<app-jolticon icon="notice" />
					<strong><translate>Java Applets have been deprecated.</translate></strong>
					<translate>
						You can no longer edit your Java Applet builds, although gamers will still
						be able to play them if their browsers support them. You can add .jar files
						as downloadables and the Game Jolt Client will correctly launch them for
						users instead.
					</translate>
				</div>
				<div
					v-else-if="model.type === GameBuild.TYPE_SILVERLIGHT"
					class="alert alert-notice sans-margin"
				>
					<app-jolticon icon="notice" />
					<strong><translate>Silverlight builds have been deprecated.</translate></strong>
					<translate>
						You can no longer edit your Silverlight builds, although gamers will still
						be able to play them if their browsers support them.
					</translate>
				</div>

				<!--
					Don't attach to the ng-form above or the scope will be messed up and not able to submit the form.
				-->
				<div v-if="!isDeprecated">
					<template v-if="archiveError">
						<app-expand class="-archive-error" :when="true">
							<div class="alert alert-notice sans-margin-bottom">
								<p>{{ archiveError }}</p>
								<p><translate>Please re-upload with a valid archive.</translate></p>
							</div>
						</app-expand>
					</template>

					<div
						v-else-if="
							model.primary_file.is_archive && !model.primary_file.is_archive_ready
						"
					>
						<app-loading
							class="-rummaging"
							:label="
								$gettext(`Give us a second, we're rummaging through the archive...`)
							"
						/>
					</div>

					<template v-else>
						<div
							v-if="isSettingPlatform"
							class="game-build-form-spinner no-animate-leave"
						>
							<app-loading :hide-label="true" />
						</div>

						<!--
							Platform Selector
						-->
						<div
							v-if="model.type === GameBuild.TYPE_DOWNLOADABLE && !forceOther"
							class="downloadable-platforms"
						>
							<!--
								When this build is not able to launch on certain platforms.
							-->
							<p v-if="restrictedPlatforms.length">
								<app-jolticon icon="info-circle" />
								<translate>
									This build is not launchable on certain platforms. They've been
									disabled below.
								</translate>
							</p>

							<p
								:class="{
									'help-block': true,
									'sans-margin-top': !restrictedPlatforms.length,
								}"
							>
								<translate>
									Select "Other" if this build is for a platform that's not shown,
									or if it's a non-executable file such as a PDF.
								</translate>
							</p>

							<div class="clearfix">
								<div v-for="platform of platformOptions" :key="platform.key">
									<app-form-group
										:name="`os_${platform.key}`"
										:optional="true"
										:hide-label="true"
									>
										<div
											class="checkbox"
											:class="{ disabled: isPlatformDisabled(platform.key) }"
										>
											<label>
												<app-form-control-checkbox
													:disabled="isPlatformDisabled(platform.key)"
													@changed="platformChanged(platform.key)"
												/>
												{{ platform.label }}
											</label>
										</div>
									</app-form-group>
								</div>
							</div>

							<app-expand :when="hasPlatformsError">
								<div class="alert alert-notice sans-margin-bottom">
									<translate>
										You have to select at least one platform on which your build
										runs (or "Other").
									</translate>
								</div>
							</app-expand>
						</div>

						<!--
							This happens when it's not a launchable file type.
							In that case, it is forced as "other".
						-->
						<p v-if="forceOther" class="sans-margin">
							<app-jolticon icon="info-circle" />
							<translate>
								This build doesn't seem to be a Windows, macOS, or Linux build, so
								we've marked it as 'Other' for you.
							</translate>
						</p>

						<!--
							Launch Options
						-->
						<fieldset
							v-if="
								!hasPlatformsError &&
								model.type === GameBuild.TYPE_DOWNLOADABLE &&
								!model.os_other
							"
							class="form-horizontal"
						>
							<legend><translate>Launch Options</translate></legend>

							<div v-if="model.primary_file.is_archive">
								<app-form-group
									v-for="platform of availablePlatformOptions"
									:key="platform.key"
									:name="`launch_${platform.key}`"
									:label="platform.label"
									label-class="col-sm-3"
								>
									<div class="col-sm-9">
										<div class="input-group input-group-sm">
											<app-form-control
												:validators="[
													validateMaxLength(500)
												]"
												@changed="onBuildFieldChanged"
											/>
											<!--  TODO: this doesn't register when the file is selected to clear the error -->

											<span class="input-group-addon">
												<a
													v-app-tooltip="
														$gettext(
															`dash.games.releases.builds.launch_options.form.file_selector_tooltip`
														)
													"
													class="link-unstyled"
													@click="openFileSelector(platform.key)"
												>
													<app-jolticon icon="ellipsis-h" />
												</a>
											</span>
										</div>

										<app-form-control-errors
											:ignore-dirty="true"
											:label="
												$gettext(
													`dash.games.releases.builds.launch_options.form.file_error_label`
												)
											"
										/>
									</div>
								</app-form-group>
							</div>

							<app-expand :when="serverErrors.launchOptions">
								<div class="alert alert-notice">
									<strong>
										<translate>
											The launch options you entered are invalid.
										</translate>
									</strong>
									<translate>
										Make sure each selected file is in your build and that it
										works on the appropriate operating system.
									</translate>
								</div>
							</app-expand>

							<app-expand :when="!model.primary_file.is_archive">
								<div>
									<p>
										<strong>
											<translate>
												We've detected that this build is a standalone
												executable file.
											</translate>
										</strong>
									</p>
									<p><translate>It can be launched automatically.</translate></p>
								</div>
							</app-expand>
						</fieldset>

						<!--
							Browser Embed Dimensions
						-->
						<div v-if="isBrowserBased">
							<app-form-group
								name="embed_fit_to_screen"
								:label="$gettext(`Fit to screen?`)"
							>
								<app-form-control-toggle
									class="pull-right"
									@changed="onBuildFieldChanged"
								/>

								<p class="help-block">
									<translate>
										If your game can stretch to fit the browser viewport, you
										can turn this option on to take up the whole available
										space.
									</translate>
								</p>
							</app-form-group>

							<template v-if="!isFitToScreen">
								<hr />

								<p class="help-block">
									<translate>
										These are the dimensions at which your browser build will be
										displayed.
									</translate>
								</p>

								<div class="row">
									<div class="col-sm-6">
										<app-form-group
											name="embed_width"
											:label="$gettext(`dash.games.builds.form.width_label`)"
										>
											<app-form-control
												class="input-sm"
												type="number"
												@changed="onBuildFieldChanged"
											/>
											<app-form-control-errors :ignore-dirty="true" />
										</app-form-group>
									</div>
									<div class="col-sm-6">
										<app-form-group
											name="embed_height"
											:label="$gettext(`dash.games.builds.form.height_label`)"
										>
											<app-form-control
												class="input-sm"
												type="number"
												@changed="onBuildFieldChanged"
											/>
											<app-form-control-errors :ignore-dirty="true" />
										</app-form-group>
									</div>
								</div>
							</template>

							<app-form-group
								name="https_enabled"
								:label="$gettext(`HTTPS support?`)"
							>
								<app-form-control-toggle
									class="pull-right"
									@changed="onBuildFieldChanged"
								/>

								<p class="help-block">
									<translate>
										If your game doesn't work on HTTPS you can disable this and
										we'll serve it over HTTP instead. It's highly recommended to
										get your game working on HTTPS! Some features may not work
										on HTTP in more recent browsers.
									</translate>
								</p>
							</app-form-group>
						</div>

						<!--
							Unity Right Click Menu
						-->
						<app-form-group
							v-if="formModel.type === GameBuild.TYPE_UNITY"
							name="browser_disable_right_click"
							:label="$gettext(`dash.games.builds.form.disable_right_click_label`)"
						>
							<p class="help-block">
								<translate>
									dash.games.builds.form.disable_right_click_help
								</translate>
							</p>
							<app-form-control-toggle @changed="onBuildFieldChanged" />
						</app-form-group>

						<div v-if="model.type === GameBuild.TYPE_UNITY" class="alert alert-notice">
							<app-jolticon icon="notice" />
							<strong>
								<translate>
									Most browsers have stopped supporting the Unity Web Player.
								</translate>
							</strong>
							<translate>Please consider exporting to WebGL instead.</translate>
						</div>

						<p v-if="model.type === GameBuild.TYPE_ROM" class="sans-margin">
							<app-jolticon icon="info-circle" />
							<translate
								:translate-params="{
									platform: emulatorsInfo[model.emulator_type],
								}"
								translate-comment="%{ platform } will be the platform this ROM works on, such as Game Boy, NES, etc."
							>
								We've detected this build is actually a ROM for the %{ platform }.
								We will automatically emulate it in browser for you!
							</translate>
						</p>

						<app-expand :when="hasBrowserError">
							<div class="alert alert-notice sans-margin-bottom">
								<translate>
									This build has more info to fill in before it will be available
									in this release.
								</translate>
							</div>
						</app-expand>
					</template>

					<app-form-button
						v-if="valid && wasChanged"
						class="game-build-form-submit-button"
					>
						<translate>Save Build</translate>
					</app-form-button>
				</div>
			</app-form>
		</template>
	</app-card-list-item>
</template>

<style lang="stylus" src="./build.styl" scoped></style>
