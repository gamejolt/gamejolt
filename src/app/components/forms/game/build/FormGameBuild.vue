<script lang="ts">
import { Ref } from 'vue';

export interface FormGameBuildInterface {
	buildId: number;
	isDeprecated: Ref<boolean>;
	save: () => Promise<boolean>;
}
</script>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import AppCardListItem from '../../../../../_common/card/list/AppCardListItem.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import { formatFuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../../_common/filters/number';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
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
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { arrayRemove } from '../../../../../utils/array';
import { useFormGameRelease } from '../release/FormGameRelease.vue';
import { showArchiveFileSelectorModal } from './archive-file-selector-modal.service';

type GameBuildFormModel = GameBuildModel & {
	launch_windows: string;
	launch_windows_64: string;
	launch_mac: string;
	launch_mac_64: string;
	launch_linux: string;
	launch_linux_64: string;
	launch_other: string;
};

type Props = {
	game: GameModel;
	package: GamePackageModel;
	release: GameReleaseModel;
	releaseLaunchOptions: GameBuildLaunchOptionModel[];
	buildDownloadCounts: { [buildId: number]: number };
	builds: GameBuildModel[];
	model?: GameBuildModel;
};

const props = defineProps<Props>();
const { game } = props;

const emit = defineEmits<{
	'remove-build': [formModel: GameBuildFormModel];
	'update-launch-options': [formModel: GameBuildFormModel, launchOptions: any];
}>();

const releaseForm = useFormGameRelease()!;

const maxFilesize = ref(0);
const restrictedPlatforms = ref<string[]>([]);
const forceOther = ref(false);
const romTypes = ref<string[]>([]);
const isSettingPlatform = ref(false);
const prevCount = ref(-1);
const buildLaunchOptions = ref<GameBuildLaunchOptionModel[]>([]);
const wasChanged = ref(false);

const GameBuildTypes = {
	downloadable: GameBuildType.Downloadable,
	html: GameBuildType.Html,
	flash: GameBuildType.Flash,
	unity: GameBuildType.Unity,
	silverlight: GameBuildType.Silverlight,
	applet: GameBuildType.Applet,
	rom: GameBuildType.Rom,
};
const GameBuildStatuses = {
	adding: GameBuildStatus.Adding,
	active: GameBuildStatus.Active,
};
const GameBuildErrors = {
	missingFields: GameBuildError.MissingFields,
};

const form: FormController<GameBuildFormModel> = createForm({
	model: toRef(props, 'model'),
	modelClass: GameBuildModel as any,
	modelSaveHandler: $saveGameBuild,
	reloadOnSubmit: true,
	loadUrl: computed(
		() =>
			`/web/dash/developer/games/builds/save/${game.id}/${props.package.id}/${props.release.id}/${props.model!.id}`
	),
	onInit() {
		maxFilesize.value = 0;
		restrictedPlatforms.value = [];
		forceOther.value = false;
		romTypes.value = [];
		isSettingPlatform.value = false;
		prevCount.value = -1;
		buildLaunchOptions.value = [];
		wasChanged.value = false;

		// This populates buildLaunchOptions for the first time.
		onReleaseLaunchOptionsChanged();
		validatePlatforms();
	},
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		restrictedPlatforms.value = payload.restrictedPlatforms;
		forceOther.value = payload.forceOther;
		romTypes.value = payload.romTypes;
	},
	onSubmitSuccess(response: any) {
		if (game) {
			game.assign(response.game);
		}
	},
});

const pollUrl = computed(
	() =>
		`/web/dash/developer/games/builds/poll-progress/${game.id}/${props.package.id}/${props.release.id}/${props.model!.id}`
);

const shouldPollProgress = computed(
	() => props.model && props.model.status === GameBuildStatus.Adding && !archiveError.value
);

const archiveError = computed(() => {
	if (!props.model) {
		return '';
	}
	if (props.model.hasError(GameBuildError.InvalidArchive)) {
		return $gettext(
			`The archive you uploaded looks corrupted, we can't extract it on our end.`
		);
	}
	if (props.model.hasError(GameBuildError.PasswordArchive)) {
		return $gettext(`The archive you uploaded is password-protected.`);
	}
	if (props.model.hasError(GameBuildError.NotHtmlArchive)) {
		return $gettext(
			`The archive you uploaded doesn't look like a valid html build. We expect a zip with an index.html at the root of the archive.`
		);
	}
	return '';
});

const hasBrowserError = computed(() => form.hasCustomError('browser'));
const isBrowserBased = computed(() => props.model!.isBrowserBased);
const hasPlatformsError = computed(() => form.hasCustomError('platforms'));

const isDeprecated = computed(() =>
	Boolean(
		props.model &&
			(props.model.type === GameBuildType.Applet ||
				props.model.type === GameBuildType.Silverlight)
	)
);

const platformOptions = [
	{ key: 'windows', label: $gettext('Windows'), icon: 'windows' },
	{ key: 'windows_64', label: $gettext('Windows 64-bit'), icon: 'windows' },
	{ key: 'mac', label: $gettext('Mac'), icon: 'mac' },
	{ key: 'mac_64', label: $gettext('Mac 64-bit'), icon: 'mac' },
	{ key: 'linux', label: $gettext('Linux'), icon: 'linux' },
	{ key: 'linux_64', label: $gettext('Linux 64-bit'), icon: 'linux' },
	{ key: 'other', label: $gettext('Other'), icon: 'other-os' },
];

const platformsValid = computed(() => {
	if (!props.model) {
		return false;
	}
	if (props.model.type !== GameBuildType.Downloadable) {
		return true;
	}
	return (
		!!props.model.os_windows ||
		!!props.model.os_mac ||
		!!props.model.os_linux ||
		!!props.model.os_windows_64 ||
		!!props.model.os_mac_64 ||
		!!props.model.os_linux_64 ||
		!!props.model.os_other
	);
});

const availablePlatformOptions = computed(() => {
	if (!props.model) {
		return [];
	}
	return platformOptions.filter(platform => (props.model as any)[`os_${platform.key}`]);
});

const isFitToScreen = computed(
	() => form.formModel && form.formModel.embed_fit_to_screen
);

// Register with the release form.
onMounted(() => {
	releaseForm.buildForms.value.push({
		buildId: props.model!.id,
		isDeprecated: computed(() => isDeprecated.value),
		save: () => form.submit(),
	});
});

onBeforeUnmount(() => {
	arrayRemove(releaseForm.buildForms.value, i => i.buildId === props.model!.id);
});

// Watch release launch options.
watch(
	() => props.releaseLaunchOptions,
	() => onReleaseLaunchOptionsChanged(),
	{ deep: true }
);

// Watch browser dimensions.
watch(
	[
		() => form.formModel.embed_width,
		() => form.formModel.embed_height,
		() => form.formModel.embed_fit_to_screen,
	],
	() => {
		const hasError =
			isBrowserBased.value &&
			!isFitToScreen.value &&
			(!form.formModel.embed_width || !form.formModel.embed_height);

		if (hasError) {
			form.setCustomError('browser');
		} else {
			form.clearCustomError('browser');
		}
	}
);

function onReleaseLaunchOptionsChanged() {
	buildLaunchOptions.value = props.releaseLaunchOptions.filter(
		launchOption => launchOption.game_build_id === props.model!.id
	);

	if (prevCount.value === -1) {
		prevCount.value = buildLaunchOptions.value.length;
	}

	for (const launchOption of buildLaunchOptions.value) {
		(form.formModel as any)['launch_' + launchOption.os] = launchOption.executable_path;
	}

	prevCount.value = buildLaunchOptions.value.length;
}

function remove() {
	emit('remove-build', props.model! as GameBuildFormModel);
}

function isPlatformDisabled(platform: string) {
	if (restrictedPlatforms.value && Array.isArray(restrictedPlatforms.value)) {
		if (restrictedPlatforms.value.indexOf(platform) !== -1) {
			return true;
		}
	}

	if (platform !== 'other' && props.model!.os_other) {
		return true;
	} else if (
		platform === 'other' &&
		(props.model!.os_windows ||
			props.model!.os_mac ||
			props.model!.os_linux ||
			props.model!.os_windows_64 ||
			props.model!.os_mac_64 ||
			props.model!.os_linux_64)
	) {
		return true;
	}

	if (platform !== 'other') {
		const foundBuild = props.builds.find(
			value => (value as any)[`os_${platform}`] === true
		);
		if (foundBuild && foundBuild.id !== props.model!.id) {
			return true;
		}
	}

	return false;
}

async function platformChanged(platform: string) {
	isSettingPlatform.value = true;

	try {
		const params = [
			game.id,
			props.package.id,
			props.release.id,
			props.model!.id,
			platform,
			(form.formModel as any)['os_' + platform] ? 1 : 0,
		];

		const response = await Api.sendRequest(
			'/web/dash/developer/games/builds/set-platform/' + params.join('/'),
			{},
			{ detach: true }
		);

		props.model!.assign(response.gameBuild);
		game.assign(response.game);

		// Copy new platforms to the form model.
		for (const _platform of GameBuildLaunchablePlatforms) {
			const key = 'os_' + _platform;
			(form.formModel as any)[key] = (props.model as any)[key];
		}

		// Copy new launch options in.
		emit('update-launch-options', props.model! as GameBuildFormModel, response.launchOptions);
	} catch (err) {
		console.error(err);
		showErrorGrowl($gettext('Could not set the platform for some reason.'));
	} finally {
		isSettingPlatform.value = false;
	}

	validatePlatforms();
}

function validatePlatforms() {
	if (!platformsValid.value) {
		form.setCustomError('platforms');
	} else {
		form.clearCustomError('platforms');
	}
}

function getExecutablePath(platform: string) {
	return (form.formModel as any)['launch_' + platform];
}

async function openFileSelector(platform: string) {
	const selected = await showArchiveFileSelectorModal(
		game.id,
		props.package.id,
		props.release.id,
		props.model!.id,
		props.model!.primary_file.id,
		platform
	);

	if (!selected) {
		return;
	}

	(form.formModel as any)['launch_' + platform] = selected;
	onBuildFieldChanged();
}

function processPollerResponse(response: any) {
	props.model!.assign(response.build);
	if (response.game) {
		game.assign(response.game);
	}
}

function onBuildFieldChanged() {
	wasChanged.value = true;
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

								<AppExpand :when="form.serverErrors.launchOptions">
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
							v-if="form.formModel.type === GameBuildTypes.unity"
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

					<AppFormButton v-if="form.valid && wasChanged" class="game-build-form-submit-button">
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
