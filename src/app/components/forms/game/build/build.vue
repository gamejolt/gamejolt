<script lang="ts">
import { computed, Ref } from 'vue';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppCardListItem from '../../../../../_common/card/list/AppCardListItem.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../../_common/filters/number';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';
import {
	$saveGameBuild,
	GameBuildEmulatorInfo,
	GameBuildError,
	GameBuildModel,
	GameBuildStatus,
	GameBuildType,
} from '../../../../../_common/game/build/build.model';
import {
	GameBuildLaunchablePlatforms,
	GameBuildLaunchOptionModel,
} from '../../../../../_common/game/build/launch-option/launch-option.model';
import { GameModel } from '../../../../../_common/game/game.model';
import { GamePackageModel } from '../../../../../_common/game/package/package.model';
import { GameReleaseModel } from '../../../../../_common/game/release/release.model';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import AppProgressBar from '../../../../../_common/progress/AppProgressBar.vue';
import AppProgressPoller from '../../../../../_common/progress/poller/AppProgressPoller.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../utils/array';
import { shallowSetup } from '../../../../../utils/vue';
import { useFormGameRelease } from '../release/release.vue';
import { showArchiveFileSelectorModal } from './archive-file-selector-modal.service';

export interface FormGameBuildInterface {
	buildId: number;
	isDeprecated: Ref<boolean>;
	save: () => Promise<boolean>;
}

type GameBuildFormModel = GameBuildModel & {
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
		AppTooltip: vAppTooltip,
	},
})
export default class FormGameBuild extends mixins(Wrapper) implements FormOnLoad {
	modelClass = GameBuildModel as any;
	modelSaveHandler = $saveGameBuild;

	@Prop(Object)
	game!: GameModel;

	@Prop(Object)
	package!: GamePackageModel;

	@Prop(Object)
	release!: GameReleaseModel;

	@Prop(Array)
	releaseLaunchOptions!: GameBuildLaunchOptionModel[];

	@Prop(Object)
	buildDownloadCounts!: {
		[buildId: number]: number;
	};

	@Prop(Array)
	builds!: GameBuildModel[];

	releaseForm = shallowSetup(() => useFormGameRelease()!);

	maxFilesize = 0;
	restrictedPlatforms: string[] = [];
	forceOther = false;
	romTypes: string[] = [];
	isSettingPlatform = false;
	prevCount = -1;
	buildLaunchOptions: GameBuildLaunchOptionModel[] = [];
	wasChanged = false;

	readonly formatNumber = formatNumber;
	readonly formatFuzzynumber = formatFuzzynumber;
	readonly formatFilesize = formatFilesize;
	readonly GameBuild = GameBuildModel;
	readonly GameBuildTypes = {
		downloadable: GameBuildType.Downloadable,
		html: GameBuildType.Html,
		flash: GameBuildType.Flash,
		unity: GameBuildType.Unity,
		silverlight: GameBuildType.Silverlight,
		applet: GameBuildType.Applet,
		rom: GameBuildType.Rom,
	};
	readonly GameBuildStatuses = {
		adding: GameBuildStatus.Adding,
		active: GameBuildStatus.Active,
	};
	readonly GameBuildErrors = {
		missingFields: GameBuildError.MissingFields,
	};
	readonly GameBuildEmulatorInfo = GameBuildEmulatorInfo;

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
		return this.model && this.model.status === GameBuildStatus.Adding && !this.archiveError;
	}

	get archiveError() {
		if (!this.model) {
			return '';
		}

		if (this.model.hasError(GameBuildError.InvalidArchive)) {
			return $gettext(
				`The archive you uploaded looks corrupted, we can't extract it on our end.`
			);
		}

		if (this.model.hasError(GameBuildError.PasswordArchive)) {
			return $gettext(`The archive you uploaded is password-protected.`);
		}

		if (this.model.hasError(GameBuildError.NotHtmlArchive)) {
			return $gettext(
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
		return Boolean(
			this.model &&
				(this.model.type === GameBuildType.Applet ||
					this.model.type === GameBuildType.Silverlight)
		);
	}

	get platformOptions() {
		return [
			{
				key: 'windows',
				label: $gettext('Windows'),
				icon: 'windows',
			},
			{
				key: 'windows_64',
				label: $gettext('Windows 64-bit'),
				icon: 'windows',
			},
			{
				key: 'mac',
				label: $gettext('Mac'),
				icon: 'mac',
			},
			{
				key: 'mac_64',
				label: $gettext('Mac 64-bit'),
				icon: 'mac',
			},
			{
				key: 'linux',
				label: $gettext('Linux'),
				icon: 'linux',
			},
			{
				key: 'linux_64',
				label: $gettext('Linux 64-bit'),
				icon: 'linux',
			},
			{
				key: 'other',
				label: $gettext('Other'),
				icon: 'other-os',
			},
		];
	}

	get platformsValid() {
		if (!this.model) {
			return false;
		}

		if (this.model.type !== GameBuildType.Downloadable) {
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

	get isFitToScreen() {
		return this.formModel && this.formModel.embed_fit_to_screen;
	}

	created() {
		this.form.reloadOnSubmit = true;
		this.releaseForm.buildForms.value.push({
			buildId: this.model!.id,
			isDeprecated: computed(() => this.isDeprecated),
			save: () => this.save(),
		});
	}

	beforeUnmount() {
		arrayRemove(this.releaseForm.buildForms.value, i => i.buildId === this.model!.id);
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
			for (const _platform of GameBuildLaunchablePlatforms) {
				const key = 'os_' + _platform;

				// oh geez
				this.setField(key as any, (this.model as any)[key]);
			}

			// Copy new launch options in.
			this.emitUpdateLaunchOptions(this.model!, response.launchOptions);
		} catch (err) {
			console.error(err);
			showErrorGrowl($gettext('Could not set the platform for some reason.'));
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
		const selected = await showArchiveFileSelectorModal(
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
	<AppCardListItem class="game-build-form" force-active :item="model">
		<a class="card-remove" @click="remove()">
			<AppJolticon icon="remove" />
		</a>

		<div class="card-stats">
			<div class="stat-big stat-big-smaller">
				<div class="stat-big-label">
					<AppTranslate>Downloads</AppTranslate>
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
				<small class="text-muted">
					({{ formatFilesize(model.primary_file.filesize) }})
				</small>
			</h5>
		</div>

		<div class="card-meta">
			<span v-if="model.type === GameBuildTypes.downloadable" class="tag">
				<AppJolticon icon="download" />
				<AppTranslate>Downloadable</AppTranslate>
			</span>
			<span v-else-if="model.type === GameBuildTypes.html" class="tag">
				<AppJolticon icon="html5" />
				<AppTranslate>HTML</AppTranslate>
			</span>
			<span v-else-if="model.type === GameBuildTypes.flash" class="tag">
				<AppJolticon icon="flash" />
				<AppTranslate>Flash</AppTranslate>
			</span>
			<span v-else-if="model.type === GameBuildTypes.unity" class="tag">
				<AppJolticon icon="unity" />
				<AppTranslate>Unity</AppTranslate>
			</span>
			<span v-else-if="model.type === GameBuildTypes.silverlight" class="tag">
				<AppJolticon icon="silverlight" />
				<AppTranslate>Silverlight</AppTranslate>
			</span>
			<span v-else-if="model.type === GameBuildTypes.applet" class="tag">
				<AppJolticon icon="java" />
				<AppTranslate>Java Applet</AppTranslate>
			</span>
			<span v-else-if="model.type === GameBuildTypes.rom" class="tag">
				<AppJolticon icon="rom" />
				<AppTranslate>ROM</AppTranslate>
			</span>

			<!--
				Missing fields.
			-->
			<span v-if="model.hasError(GameBuildErrors.missingFields)" class="tag tag-notice">
				<AppJolticon icon="notice" />
				<AppTranslate>Incomplete</AppTranslate>
			</span>

			<span v-else>
				<span v-if="model.status === GameBuildStatuses.adding" class="tag">
					<AppTranslate>Processing</AppTranslate>
				</span>
				<span
					v-else-if="model.status === GameBuildStatuses.active"
					class="tag tag-highlight"
				>
					<AppJolticon icon="check" />
					<AppTranslate>Active</AppTranslate>
				</span>
			</span>
		</div>

		<!--
			Processing the build.
		-->
		<template v-if="shouldPollProgress">
			<AppProgressPoller
				:url="pollUrl"
				@progress="processPollerResponse"
				@complete="processPollerResponse"
			/>

			<AppExpand :when="!model.errors">
				<br />
				<AppProgressBar thin indeterminate active :percent="100" />

				<div v-translate class="text-center small">
					<strong>Processing build.</strong>
					It will become available in this release as soon as we're done.
				</div>
			</AppExpand>
		</template>

		<template #body>
			<AppForm :controller="form">
				<div
					v-if="model.type === GameBuildTypes.applet"
					class="alert alert-notice sans-margin"
				>
					<AppJolticon icon="notice" />
					<strong><AppTranslate>Java Applets have been deprecated.</AppTranslate></strong>
					<AppTranslate>
						You can no longer edit your Java Applet builds, although gamers will still
						be able to play them if their browsers support them. You can add .jar files
						as downloadables and the Game Jolt Client will correctly launch them for
						users instead.
					</AppTranslate>
				</div>
				<div
					v-else-if="model.type === GameBuildTypes.silverlight"
					class="alert alert-notice sans-margin"
				>
					<AppJolticon icon="notice" />
					<strong>
						<AppTranslate> Silverlight builds have been deprecated. </AppTranslate>
					</strong>
					<AppTranslate>
						You can no longer edit your Silverlight builds, although gamers will still
						be able to play them if their browsers support them.
					</AppTranslate>
				</div>

				<!--
					Don't attach to the ng-form above or the scope will be messed up and not able to submit the form.
				-->
				<div v-if="!isDeprecated">
					<template v-if="archiveError">
						<AppExpand class="-archive-error" :when="true">
							<div class="alert alert-notice sans-margin-bottom">
								<p>{{ archiveError }}</p>
								<p>
									<AppTranslate>
										Please re-upload with a valid archive.
									</AppTranslate>
								</p>
							</div>
						</AppExpand>
					</template>

					<div
						v-else-if="
							model.primary_file.is_archive && !model.primary_file.is_archive_ready
						"
					>
						<AppLoading
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
							<AppLoading :hide-label="true" />
						</div>

						<!--
							Platform Selector
						-->
						<div
							v-if="model.type === GameBuildTypes.downloadable && !forceOther"
							class="downloadable-platforms"
						>
							<!--
								When this build is not able to launch on certain platforms.
							-->
							<p v-if="restrictedPlatforms.length">
								<AppJolticon icon="info-circle" />
								<AppTranslate>
									This build is not launchable on certain platforms. They've been
									disabled below.
								</AppTranslate>
							</p>

							<p
								:class="{
									'help-block': true,
									'sans-margin-top': !restrictedPlatforms.length,
								}"
							>
								<AppTranslate>
									Select "Other" if this build is for a platform that's not shown,
									or if it's a non-executable file such as a PDF.
								</AppTranslate>
							</p>

							<div class="clearfix">
								<div v-for="platform of platformOptions" :key="platform.key">
									<AppFormGroup
										:name="`os_${platform.key}`"
										:optional="true"
										:hide-label="true"
									>
										<div
											class="checkbox"
											:class="{ disabled: isPlatformDisabled(platform.key) }"
										>
											<label>
												<AppFormControlCheckbox
													:disabled="isPlatformDisabled(platform.key)"
													@changed="platformChanged(platform.key)"
												/>
												{{ platform.label }}
											</label>
										</div>
									</AppFormGroup>
								</div>
							</div>

							<AppExpand :when="hasPlatformsError">
								<div class="alert alert-notice sans-margin-bottom">
									<AppTranslate>
										You have to select at least one platform on which your build
										runs (or "Other").
									</AppTranslate>
								</div>
							</AppExpand>
						</div>

						<!--
							This happens when it's not a launchable file type.
							In that case, it is forced as "other".
						-->
						<p v-if="forceOther" class="sans-margin">
							<AppJolticon icon="info-circle" />
							<AppTranslate>
								This build doesn't seem to be a Windows, macOS, or Linux build, so
								we've marked it as 'Other' for you.
							</AppTranslate>
						</p>

						<template
							v-if="
								!hasPlatformsError &&
								model.type === GameBuildTypes.downloadable &&
								!model.os_other
							"
						>
							<hr />

							<AppFormGroup name="is_installer" :label="$gettext(`Is Installer?`)">
								<template #inline-control>
									<AppFormControlToggle @changed="onBuildFieldChanged" />
								</template>

								<p class="help-block">
									<AppTranslate>
										The Desktop App does not support automatically installing
										games using installers. It will download them through the
										browser instead.
									</AppTranslate>
								</p>
							</AppFormGroup>

							<!--
								Launch Options
							-->
							<fieldset class="form-horizontal">
								<legend><AppTranslate>Launch Options</AppTranslate></legend>

								<div v-if="model.primary_file.is_archive">
									<AppFormGroup
										v-for="platform of availablePlatformOptions"
										:key="platform.key"
										:name="`launch_${platform.key}`"
										:label="platform.label"
										label-class="col-sm-3"
									>
										<div class="col-sm-9">
											<div class="input-group input-group-sm">
												<AppFormControl
													:validators="[validateMaxLength(500)]"
													@changed="onBuildFieldChanged"
												/>
												<!--  TODO: this doesn't register when the file is selected to clear the error -->

												<span class="input-group-addon">
													<a
														v-app-tooltip="
															$gettext(`Browse file list.`)
														"
														class="link-unstyled"
														@click="openFileSelector(platform.key)"
													>
														<AppJolticon icon="ellipsis-h" />
													</a>
												</span>
											</div>

											<AppFormControlErrors
												:ignore-dirty="true"
												:label="$gettext(`path to the executable file`)"
											/>
										</div>
									</AppFormGroup>
								</div>

								<AppExpand :when="serverErrors.launchOptions">
									<div class="alert alert-notice">
										<strong>
											<AppTranslate>
												The launch options you entered are invalid.
											</AppTranslate>
										</strong>
										<AppTranslate>
											Make sure each selected file is in your build and that
											it works on the appropriate operating system.
										</AppTranslate>
									</div>
								</AppExpand>

								<AppExpand :when="!model.primary_file.is_archive">
									<div>
										<p>
											<strong>
												<AppTranslate>
													We've detected that this build is a standalone
													executable file.
												</AppTranslate>
											</strong>
										</p>
										<p>
											<AppTranslate>
												It can be launched automatically.
											</AppTranslate>
										</p>
									</div>
								</AppExpand>
							</fieldset>
						</template>

						<!--
							Browser Embed Dimensions
						-->
						<div v-if="isBrowserBased">
							<AppFormGroup
								name="embed_fit_to_screen"
								:label="$gettext(`Fit to screen?`)"
							>
								<template #inline-control>
									<AppFormControlToggle @changed="onBuildFieldChanged" />
								</template>

								<p class="help-block">
									<AppTranslate>
										If your game can stretch to fit the browser viewport, you
										can turn this option on to take up the whole available
										space.
									</AppTranslate>
								</p>
							</AppFormGroup>

							<template v-if="!isFitToScreen">
								<hr />

								<p class="help-block">
									<AppTranslate>
										These are the dimensions at which your browser build will be
										displayed.
									</AppTranslate>
								</p>

								<div class="row">
									<div class="col-sm-6">
										<!-- TODO(vue3) translate-comment="Width of the browser game canvas" -->
										<AppFormGroup name="embed_width" :label="$gettext(`Width`)">
											<AppFormControl
												class="input-sm"
												type="number"
												@changed="onBuildFieldChanged"
											/>
											<AppFormControlErrors :ignore-dirty="true" />
										</AppFormGroup>
									</div>
									<div class="col-sm-6">
										<!-- TODO(vue3) translate-comment="Height of the browser game canvas" -->
										<AppFormGroup
											name="embed_height"
											:label="$gettext(`Height`)"
										>
											<AppFormControl
												class="input-sm"
												type="number"
												@changed="onBuildFieldChanged"
											/>
											<AppFormControlErrors :ignore-dirty="true" />
										</AppFormGroup>
									</div>
								</div>
							</template>

							<AppFormGroup name="https_enabled" :label="$gettext(`HTTPS support?`)">
								<template #inline-control>
									<AppFormControlToggle @changed="onBuildFieldChanged" />
								</template>

								<p class="help-block">
									<AppTranslate>
										If your game doesn't work on HTTPS you can disable this and
										we'll serve it over HTTP instead. It's highly recommended to
										get your game working on HTTPS! Some features may not work
										on HTTP in more recent browsers.
									</AppTranslate>
								</p>
							</AppFormGroup>
						</div>

						<!--
							Unity Right Click Menu
						-->
						<AppFormGroup
							v-if="formModel.type === GameBuildTypes.unity"
							name="browser_disable_right_click"
							:label="$gettext(`Disable right click?`)"
						>
							<p class="help-block">
								<AppTranslate>
									This allows you to disable right mouse click behavior. Only
									enable this if your game needs to intercept right clicks.
								</AppTranslate>
							</p>
							<AppFormControlToggle @changed="onBuildFieldChanged" />
						</AppFormGroup>

						<div v-if="model.type === GameBuildTypes.unity" class="alert alert-notice">
							<AppJolticon icon="notice" />
							<strong>
								<AppTranslate>
									Most browsers have stopped supporting the Unity Web Player.
								</AppTranslate>
							</strong>
							<AppTranslate>Please consider exporting to WebGL instead.</AppTranslate>
						</div>

						<p v-if="model.type === GameBuildTypes.rom" class="sans-margin">
							<AppJolticon icon="info-circle" />
							<AppTranslate
								:translate-params="{
									platform: GameBuildEmulatorInfo[model.emulator_type],
								}"
								translate-comment="%{ platform } will be the platform this ROM works on, such as Game Boy, NES, etc."
							>
								We've detected this build is actually a ROM for the %{ platform }.
								We will automatically emulate it in browser for you!
							</AppTranslate>
						</p>

						<AppExpand :when="hasBrowserError">
							<div class="alert alert-notice sans-margin-bottom">
								<AppTranslate>
									This build has more info to fill in before it will be available
									in this release.
								</AppTranslate>
							</div>
						</AppExpand>
					</template>

					<AppFormButton v-if="valid && wasChanged" class="game-build-form-submit-button">
						<AppTranslate>Save Build</AppTranslate>
					</AppFormButton>
				</div>
			</AppForm>
		</template>
	</AppCardListItem>
</template>

<style lang="stylus" scoped>

.game-build-form
	form
		display: block
		position: relative
		font-size: $font-size-small
		margin-top: 0 !important

	legend
		font-size: $font-size-h4

	&-spinner
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		content: ''
		background-color: rgba($white, 0.5)
		z-index: 2
		display: flex
		align-items: center
		justify-content: center
		animation-name: fade-in
		animation-duration: 500ms
		animation-delay: 200ms
		opacity: 0

	.build-options
		float: right
		margin-left: 20px

	.stat-big.stat-big-smaller
		margin-bottom: 0

	::v-deep(.help-block)
	.alert
		margin-bottom: ($line-height-computed / 2)

	::v-deep(.form-group)
		margin-bottom: $line-height-computed

	// Need to do this because the rule above overrides it.
	.-archive-error
		::v-deep(.sans-margin-bottom)
			margin-bottom: 0

	&-submit-button
		margin-top: ($line-height-computed / 2)

	::v-deep(.downloadable-platforms)
		&.form-group
		.form-group
			margin-left: 0
			margin-right: 0

		.form-group
			float: left
			margin-bottom: 0
			margin-right: 20px

		.checkbox
			margin-top: 0

	.-rummaging
		margin-bottom: 0

	.card-meta .tag
		margin-right: 4px
</style>
