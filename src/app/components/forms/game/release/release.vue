<script lang="ts">
import { addWeeks, startOfDay } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { inject, InjectionKey, provide, shallowRef } from 'vue';
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { shallowSetup } from '../../../../../utils/vue';
import AppCardList from '../../../../../_common/card/list/AppCardList.vue';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { validateSemver } from '../../../../../_common/form-vue/validators';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { GameBuildLaunchOption } from '../../../../../_common/game/build/launch-option/launch-option.model';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { GameRelease } from '../../../../../_common/game/release/release.model';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Timezone, TimezoneData } from '../../../../../_common/timezone/timezone.service';
import FormGameBuild, { FormGameBuildInterface } from '../build/build.vue';
import FormGameNewBuild from '../new-build/new-build.vue';

type GameReleaseFormModel = GameRelease & {
	should_publish: boolean;
};

type Controller = ReturnType<typeof createFormGameRelease>;
const Key: InjectionKey<Controller> = Symbol('form-game-release');

export function useFormGameRelease() {
	return inject(Key, null);
}

function createFormGameRelease() {
	const buildForms = shallowRef<FormGameBuildInterface[]>([]);

	async function saveBuildForms() {
		await Promise.all(buildForms.value.filter(i => i && !i.isDeprecated).map(i => i.save()));
	}

	return {
		buildForms,
		saveBuildForms,
	};
}

class Wrapper extends BaseForm<GameReleaseFormModel> {}

@Options({
	components: {
		AppCardList,
		FormGameBuild,
		FormGameNewBuild,
		AppFormControlDate,
		AppFormLegend,
	},
})
export default class FormGameRelease
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnSubmitSuccess
{
	modelClass = GameRelease as any;

	@Prop(Object)
	game!: Game;

	@Prop(Object)
	package!: GamePackage;

	@Prop(Array)
	builds!: GameBuild[];

	@Prop(Array)
	launchOptions!: GameBuildLaunchOption[];

	@Prop(Object)
	buildDownloadCounts!: { [buildId: number]: number };

	@Prop(Boolean)
	areWebBuildsLockedBySellable!: boolean;

	controller = shallowSetup(() => {
		const c = createFormGameRelease();
		provide(Key, c);
		return c;
	});

	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;
	now = 0;

	readonly Screen = Screen;
	readonly GameRelease = GameRelease;
	readonly validateSemver = validateSemver;

	@Emit('unpublish-release')
	emitUnpublishRelease(_release: GameReleaseFormModel) {}

	@Emit('remove-release')
	emitRemoveRelease(_release: GameReleaseFormModel) {}

	get loadUrl() {
		return `/web/dash/developer/games/releases/save/${this.game.id}/${this.package.id}`;
	}

	get scheduledTimezoneOffset() {
		if (!this.formModel.scheduled_for_timezone) {
			return 0;
		}

		const tz = this.timezoneByName(this.formModel.scheduled_for_timezone);
		if (!tz) {
			console.warn('Could not find timezone offset for: ' + tz);
			return 0;
		} else {
			return tz.o * 1000;
		}
	}

	get isScheduling() {
		return this.formModel.isScheduled;
	}

	async onInit() {
		await this.fetchTimezones();

		this.setField('game_id', this.game.id);
		this.setField('game_package_id', this.package.id);
	}

	onLoad(payload: any) {
		if (this.method === 'add') {
			this.setField('version_number', payload.nextVersion || '0.1.0');
		}
	}

	onBuildProcessingComplete(build: GameBuild, response: any) {
		// Just copy over the new build data into our current one.
		build.assign(response.build);
	}

	onBuildAdded(build: GameBuild) {
		this.builds.push(build);
	}

	/**
	 * Launch options include launch options for alll builds in this release.
	 * When launch options are modified for a build, we need to merge the
	 * changes back into the global array of them.
	 **/
	updateBuildLaunchOptions(build: GameBuild, launchOptions: GameBuildLaunchOption[]) {
		// Remove old ones for build.
		if (this.launchOptions && this.launchOptions.length) {
			arrayRemove(
				this.launchOptions,
				launchOption => launchOption.game_build_id === build.id
			);
		}

		// If no new ones, skip.
		if (!launchOptions || !launchOptions.length) {
			return;
		}

		// Add the new ones into the global list.
		const newLaunchOptions = GameBuildLaunchOption.populate(launchOptions);
		for (const launchOption of newLaunchOptions) {
			this.launchOptions.push(launchOption);
		}
	}

	onBuildEdited(build: GameBuild, response: any) {
		this.updateBuildLaunchOptions(build, response.launchOptions);
	}

	async removeBuild(build: GameBuild) {
		const result = await ModalConfirm.show(
			this.$gettext('Are you sure you want to remove this build?')
		);

		if (!result) {
			return;
		}

		await build.$remove(this.game);
		arrayRemove(this.builds, _build => _build.id === build.id);

		showSuccessGrowl(
			this.$gettext('The build has been removed from the release.'),
			this.$gettext('Build Removed')
		);
	}

	async save() {
		// Save all the managed build forms before saving the release. Filter
		// out invalid forms that may have been removed from the tree.
		await this.controller.saveBuildForms();
		this.form.submit();
	}

	async savePublished() {
		const result = await ModalConfirm.show(
			this.$gettext(
				'Are you sure you want to publish this release? All of its builds will become active on your game page.'
			)
		);

		if (!result) {
			return;
		}

		this.setField('should_publish', true);
		await this.save();

		showSuccessGrowl(
			this.$gettext('The release is now active on your game page.'),
			this.$gettext('Release Published')
		);
	}

	saveDraft() {
		this.setField('should_publish', false);
		return this.save();
	}

	unpublish() {
		this.emitUnpublishRelease(this.model!);
	}

	remove() {
		this.emitRemoveRelease(this.model!);
	}

	onSubmitSuccess(response: any) {
		if (this.game) {
			this.game.assign(response.game);
		}
	}

	async addSchedule() {
		if (this.formModel.scheduled_for === null) {
			this.setField('scheduled_for', startOfDay(addWeeks(Date.now(), 1)).getTime());
		}

		this.now = Date.now();
		this.setField('scheduled_for_timezone', determine().name());
		this.form.changed = true;
	}

	removeSchedule() {
		this.setField('scheduled_for_timezone', null);
		this.setField('scheduled_for', null);
		this.form.changed = true;
	}

	private async fetchTimezones() {
		// Get timezones list.
		this.timezones = await Timezone.getGroupedTimezones();
		for (const region in this.timezones) {
			for (const tz of this.timezones[region]) {
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

	private timezoneByName(timezone: string) {
		for (const region in this.timezones) {
			const tz = this.timezones[region].find(_tz => _tz.i === timezone);
			if (tz) {
				return tz;
			}
		}
		return null;
	}
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
						url: `/web/dash/developer/games/releases/check-field-availability/${game.id}/${package.id}/version_number`,
						initVal: model.version_number,
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
					:model="build"
					:game="game"
					:package="package"
					:release="model"
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
						:package="package"
						:release="model"
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
						:package="package"
						:release="model"
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

		<fieldset v-if="model.status !== GameRelease.STATUS_PUBLISHED">
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
						<AppTranslate
							>All time selection below will use this timezone.</AppTranslate
						>
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
							v-for="(timezones, region) of timezones"
							:key="region"
							:label="region"
						>
							<option
								v-for="timezone of timezones"
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
		<template v-if="model.status !== GameRelease.STATUS_PUBLISHED">
			<AppButton
				v-if="isScheduling"
				primary
				solid
				:disabled="!valid || !builds.length"
				@click="saveDraft()"
			>
				<AppTranslate>Schedule release</AppTranslate>
			</AppButton>
			<AppButton
				v-else
				primary
				solid
				:disabled="!valid || !builds.length"
				@click="savePublished()"
			>
				<AppTranslate>Publish Release</AppTranslate>
			</AppButton>

			<AppButton
				v-if="!isScheduling"
				:disabled="!valid || !builds.length"
				@click="saveDraft()"
			>
				<AppTranslate>Save Draft</AppTranslate>
			</AppButton>
		</template>
		<template v-else>
			<AppButton primary solid :disabled="!valid || !builds.length" @click="save()">
				<AppTranslate>Save Release</AppTranslate>
			</AppButton>
		</template>

		<div :class="{ 'pull-right': !Screen.isXs }">
			<br class="visible-xs" />

			<AppButton
				v-if="model.status === GameRelease.STATUS_PUBLISHED"
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
