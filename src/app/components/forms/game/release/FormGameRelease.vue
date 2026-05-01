<script lang="ts">
import { addWeeks, startOfDay } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { computed, ref, toRef } from 'vue';

import FormGameBuild from '~app/components/forms/game/build/FormGameBuild.vue';
import FormGameNewBuild from '~app/components/forms/game/new-build/FormGameNewBuild.vue';
import AppButton from '~common/button/AppButton.vue';
import AppCardList from '~common/card/list/AppCardList.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormLegend from '~common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '~common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlSelect from '~common/form-vue/controls/AppFormControlSelect.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateSemver,
} from '~common/form-vue/validators';
import { $removeGameBuild, GameBuildModel } from '~common/game/build/build.model';
import { GameBuildLaunchOptionModel } from '~common/game/build/launch-option/launch-option.model';
import { GameModel } from '~common/game/game.model';
import { GamePackageModel } from '~common/game/package/package.model';
import {
	$saveGameRelease,
	GameReleaseModel,
	GameReleaseStatus,
} from '~common/game/release/release.model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import { getScreen } from '~common/screen/screen-service';
import { Timezone, TimezoneData } from '~common/timezone/timezone.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import { arrayRemove } from '~utils/array';
</script>

<script lang="ts" setup>
type FormModel = GameReleaseModel & {
	should_publish?: boolean;
};

type Props = {
	game: GameModel;
	package: GamePackageModel;
	builds: GameBuildModel[];
	launchOptions: GameBuildLaunchOptionModel[];
	buildDownloadCounts: { [buildId: number]: number };
	areWebBuildsLockedBySellable: boolean;
	model?: GameReleaseModel;
};

const {
	game,
	package: pkg,
	builds,
	launchOptions,
	buildDownloadCounts,
	areWebBuildsLockedBySellable,
	model,
} = defineProps<Props>();

const emit = defineEmits<{
	'unpublish-release': [release: FormModel];
	'remove-release': [release: FormModel];
	submit: [formModel: FormModel];
}>();

const buildFormRefs: Record<number, InstanceType<typeof FormGameBuild>> = {};

async function saveBuildForms() {
	await Promise.all(
		Object.values(buildFormRefs)
			.filter(i => i && !i.isDeprecated)
			.map(i => i.save())
	);
}

const timezones = ref<{ [region: string]: (TimezoneData & { label?: string })[] }>(null as any);
const now = ref(0);

const GameReleaseStatusPublished = GameReleaseStatus.Published;

const form: FormController<FormModel> = createForm<FormModel>({
	model: toRef(() => model),
	modelClass: GameReleaseModel,
	modelSaveHandler: $saveGameRelease,
	loadUrl: computed(() => `/web/dash/developer/games/releases/save/${game.id}/${pkg.id}`),
	async onInit() {
		await fetchTimezones();

		form.formModel.game_id = game.id;
		form.formModel.game_package_id = pkg.id;
	},
	onLoad(payload: any) {
		if (form.method === 'add') {
			form.formModel.version_number = payload.nextVersion || '0.1.0';
		}
	},
	onSubmitSuccess(response: any) {
		if (game) {
			game.assign(response.game);
		}
		emit('submit', form.formModel);
	},
});

const scheduledTimezoneOffset = computed(() => {
	if (!form.formModel.scheduled_for_timezone) {
		return 0;
	}
	const tz = timezoneByName(form.formModel.scheduled_for_timezone);
	if (!tz) {
		console.warn('Could not find timezone offset for: ' + tz);
		return 0;
	}
	return tz.o * 1000;
});

const isScheduling = computed(() => form.formModel.isScheduled);

function onBuildAdded(build: GameBuildModel) {
	builds.push(build);
}

function updateBuildLaunchOptions(
	build: GameBuildModel,
	responseLaunchOptions: GameBuildLaunchOptionModel[]
) {
	if (launchOptions && launchOptions.length) {
		arrayRemove(launchOptions, i => i.game_build_id === build.id);
	}

	if (!responseLaunchOptions || !responseLaunchOptions.length) {
		return;
	}

	const newLaunchOptions = GameBuildLaunchOptionModel.populate(responseLaunchOptions);
	for (const launchOption of newLaunchOptions) {
		launchOptions.push(launchOption);
	}
}

function onBuildEdited(build: GameBuildModel, response: any) {
	updateBuildLaunchOptions(build, response.launchOptions);
}

async function removeBuild(build: GameBuildModel) {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this build?'));

	if (!result) {
		return;
	}

	await $removeGameBuild(build, game);
	arrayRemove(builds, i => i.id === build.id);

	showSuccessGrowl(
		$gettext('The build has been removed from the release.'),
		$gettext('Build Removed')
	);
}

async function save() {
	await saveBuildForms();
	form.submit();
}

async function savePublished() {
	const result = await showModalConfirm(
		$gettext(
			'Are you sure you want to publish this release? All of its builds will become active on your game page.'
		)
	);

	if (!result) {
		return;
	}

	form.formModel.should_publish = true;
	await save();

	showSuccessGrowl(
		$gettext('The release is now active on your game page.'),
		$gettext('Release Published')
	);
}

function saveDraft() {
	form.formModel.should_publish = false;
	return save();
}

function unpublish() {
	emit('unpublish-release', model!);
}

function remove() {
	emit('remove-release', model!);
}

async function addSchedule() {
	if (form.formModel.scheduled_for === null) {
		form.formModel.scheduled_for = startOfDay(addWeeks(Date.now(), 1)).getTime();
	}

	now.value = Date.now();
	form.formModel.scheduled_for_timezone = determine().name();
	form.changed = true;
}

function removeSchedule() {
	form.formModel.scheduled_for_timezone = null;
	form.formModel.scheduled_for = null;
	form.changed = true;
}

async function fetchTimezones() {
	timezones.value = await Timezone.getGroupedTimezones();
	for (const region in timezones.value) {
		for (const tz of timezones.value[region]) {
			let offset = '';
			if (tz.o > 0) {
				offset = `+${tz.o / 3600}:00`;
			} else if (tz.o < 0) {
				offset = `-${-tz.o / 3600}:00`;
			}
			tz.label = `(UTC${offset}) ${tz.i}`;
		}
	}
}

function timezoneByName(timezone: string) {
	for (const region in timezones.value) {
		const tz = timezones.value[region].find(_tz => _tz.i === timezone);
		if (tz) {
			return tz;
		}
	}
	return null;
}
</script>

<template>
	<AppForm class="game-release-form" :controller="form">
		<AppFormGroup name="version_number" :title="$gettext('Version Number')">
			<div class="help-block">
				<p v-translate>
					Version numbers are how you label releases.
					<br />
					Numbering should follow the format
					<code>MAJOR.MINOR.PATCH</code>
					.
				</p>
				<AppLinkHelp page="dev-packages" class="link-help">
					<AppTranslate>Learn more about choosing a good version number...</AppTranslate>
				</AppLinkHelp>
			</div>

			<AppFormControl
				:validators="[
					validateSemver(),
					validateMaxLength(50),
					validateAvailability({
						url: `/web/dash/developer/games/releases/check-field-availability/${game.id}/${pkg.id}/version_number`,
						initVal: model && model.version_number,
					}),
				]"
				:validate-delay="500"
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<fieldset>
			<AppFormLegend compact>
				<AppTranslate>Builds</AppTranslate>
			</AppFormLegend>

			<div v-if="!builds.length" class="alert alert-notice">
				<AppTranslate>
					You don't have any builds in this release yet. You won't be able to publish
					until you put some in.
				</AppTranslate>
			</div>

			<AppCardList :items="builds">
				<FormGameBuild
					v-for="build of builds"
					:key="build.id"
					:ref="
						(el: any) => {
							if (el) {
								buildFormRefs[build.id] = el;
							} else {
								delete buildFormRefs[build.id];
							}
						}
					"
					:model="build"
					:game="game"
					:package="pkg"
					:release="model!"
					:release-launch-options="launchOptions"
					:builds="builds"
					:build-download-counts="buildDownloadCounts"
					@update-launch-options="updateBuildLaunchOptions"
					@remove-build="removeBuild"
					@submit="onBuildEdited(build, $event)"
				/>
			</AppCardList>

			<br />

			<div class="row">
				<div class="col-sm-6">
					<h5 class="sans-margin-top">
						<strong><AppTranslate>Upload Downloadable Build</AppTranslate></strong>
					</h5>
					<FormGameNewBuild
						type="downloadable"
						:game="game"
						:package="pkg"
						:release="model!"
						@submit="onBuildAdded"
					/>
				</div>
				<div class="col-sm-6">
					<br class="visible-xs" />
					<h5 class="sans-margin-top">
						<strong><AppTranslate>Upload Browser Build</AppTranslate></strong>
					</h5>
					<FormGameNewBuild
						v-if="!areWebBuildsLockedBySellable"
						type="browser"
						:game="game"
						:package="pkg"
						:release="model!"
						:builds="builds"
						@submit="onBuildAdded"
					/>
					<div v-else class="alert">
						<AppTranslate>
							Browser builds can not currently be uploaded to games that are for sale.
						</AppTranslate>
					</div>
				</div>
			</div>
		</fieldset>

		<fieldset v-if="model && model.status !== GameReleaseStatusPublished">
			<AppFormLegend compact>
				<AppTranslate>Schedule publishing of release</AppTranslate>
			</AppFormLegend>

			<template v-if="!isScheduling">
				<p class="help-block">
					<AppTranslate>
						You can set a future date/time that this release will publish.
					</AppTranslate>
				</p>

				<p>
					<AppButton @click="addSchedule()">
						<AppTranslate>Add Schedule</AppTranslate>
					</AppButton>
				</p>
			</template>
			<template v-else-if="isScheduling && timezones">
				<AppFormGroup name="scheduled_for_timezone" :label="$gettext(`Timezone`)">
					<p class="help-block">
						<AppTranslate>
							All time selection below will use this timezone.
						</AppTranslate>
					</p>

					<p class="help-block">
						<strong>
							<AppTranslate>
								Should auto-detect, but if it doesn't, choose your closest city.
							</AppTranslate>
						</strong>
					</p>

					<AppFormControlSelect>
						<optgroup
							v-for="(timezoneData, region) of timezones"
							:key="region"
							:label="String(region)"
						>
							<option
								v-for="timezone of timezoneData"
								:key="timezone.label"
								:value="timezone.i"
							>
								{{ timezone.label }}
							</option>
						</optgroup>
					</AppFormControlSelect>

					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="scheduled_for" :label="$gettext(`Date and time`)">
					<AppFormControlDate
						:timezone-offset="scheduledTimezoneOffset"
						:min-date="now"
					/>
					<AppFormControlErrors :label="$gettext(`scheduled for`)" />
				</AppFormGroup>

				<p class="text-right">
					<AppButton trans @click="removeSchedule()">
						<AppTranslate>Remove Scheduling</AppTranslate>
					</AppButton>
				</p>
			</template>
		</fieldset>

		<hr />

		<!--
			The buttons in this template do submit the form through their click handlers.
			We don't use app-form-button because we needed to do some async operations before submitting.
		-->
		<template v-if="model && model.status !== GameReleaseStatusPublished">
			<AppButton
				v-if="isScheduling"
				primary
				solid
				:disabled="!form.valid || !builds.length"
				@click="saveDraft()"
			>
				<AppTranslate>Schedule release</AppTranslate>
			</AppButton>
			<AppButton
				v-else
				primary
				solid
				:disabled="!form.valid || !builds.length"
				@click="savePublished()"
			>
				<AppTranslate>Publish Release</AppTranslate>
			</AppButton>

			<AppButton
				v-if="!isScheduling"
				:disabled="!form.valid || !builds.length"
				@click="saveDraft()"
			>
				<AppTranslate>Save Draft</AppTranslate>
			</AppButton>
		</template>
		<template v-else>
			<AppButton primary solid :disabled="!form.valid || !builds.length" @click="save()">
				<AppTranslate>Save Release</AppTranslate>
			</AppButton>
		</template>

		<div :class="{ 'pull-right': !getScreen().isXs.value }">
			<br class="visible-xs" />

			<AppButton
				v-if="model && model.status === GameReleaseStatusPublished"
				trans
				@click="unpublish()"
			>
				<AppTranslate>Unpublish Release</AppTranslate>
			</AppButton>

			<AppButton trans @click="remove()">
				<AppTranslate>Remove Release</AppTranslate>
			</AppButton>
		</div>
	</AppForm>
</template>
