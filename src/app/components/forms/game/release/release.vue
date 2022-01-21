<script lang="ts">
import { addWeeks, startOfDay } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
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
import FormGameBuildTS from '../build/build';
import FormGameBuild from '../build/build.vue';
import FormGameNewBuild from '../new-build/new-build.vue';

type GameReleaseFormModel = GameRelease & {
	should_publish: boolean;
};

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
	areBuildsLockedByJam!: boolean;

	@Prop(Boolean)
	areWebBuildsLockedBySellable!: boolean;

	buildForms: FormGameBuildTS[] = [];
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
		console.log('Build edited:');
		console.log(response);
		this.updateBuildLaunchOptions(build, response.launchOptions);
	}

	async removeBuild(build: GameBuild) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.releases.builds.remove_build_confirmation')
		);

		if (!result) {
			return;
		}

		await build.$remove(this.game);
		arrayRemove(this.builds, _build => _build.id === build.id);

		showSuccessGrowl(
			this.$gettext('dash.games.releases.builds.remove_build_growl'),
			this.$gettext('dash.games.releases.builds.remove_build_growl_title')
		);
	}

	async save() {
		// Save all the managed build forms before saving the release.
		await Promise.all(this.buildForms.filter(i => !i.isDeprecated).map(i => i.save()));
		this.form.submit();
	}

	async savePublished() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.releases.manage.publish_release_confirmation')
		);

		if (!result) {
			return;
		}

		this.setField('should_publish', true);
		await this.save();

		showSuccessGrowl(
			this.$gettext('dash.games.releases.manage.publish_release_growl'),
			this.$gettext('dash.games.releases.manage.publish_release_growl_title')
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
	<app-form class="game-release-form" :controller="form">
		<app-form-group
			name="version_number"
			:title="$gettext('dash.games.releases.form.version_number_label')"
		>
			<div class="help-block">
				<p v-translate>
					Version numbers are how you label releases.
					<br />
					Numbering should follow the format
					<code>MAJOR.MINOR.PATCH</code>
					.
				</p>
				<app-link-help page="dev-packages" class="link-help">
					<translate>dash.games.releases.form.version_number_help_link</translate>
				</app-link-help>
			</div>

			<app-form-control
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
			<app-form-control-errors />
		</app-form-group>

		<fieldset>
			<app-form-legend compact>
				<translate>Builds</translate>
			</app-form-legend>

			<div v-if="!builds.length" class="alert alert-notice">
				<translate>
					You don't have any builds in this release yet. You won't be able to publish
					until you put some in.
				</translate>
			</div>

			<app-card-list :items="builds">
				<form-game-build
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
			</app-card-list>

			<br />

			<div v-if="areBuildsLockedByJam" class="alert alert-notice sans-margin">
				<app-jolticon icon="notice" />
				<strong>
					<translate>
						Your game is part of a jam that locks builds during voting.
					</translate>
				</strong>
				<translate>
					You will not be able to add new builds until the voting period ends.
				</translate>
			</div>
			<div v-else class="row">
				<div class="col-sm-6">
					<h5 class="sans-margin-top">
						<strong><translate>Upload Downloadable Build</translate></strong>
					</h5>
					<form-game-new-build
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
						<strong><translate>Upload Browser Build</translate></strong>
					</h5>
					<form-game-new-build
						v-if="!areWebBuildsLockedBySellable"
						type="browser"
						:game="game"
						:package="package"
						:release="model"
						:builds="builds"
						@submit="onBuildAdded"
					/>
					<div v-else class="alert">
						<translate>
							Browser builds can not currently be uploaded to games that are for sale.
						</translate>
					</div>
				</div>
			</div>
		</fieldset>

		<fieldset v-if="model.status !== GameRelease.STATUS_PUBLISHED">
			<app-form-legend compact>
				<translate>Schedule publishing of release</translate>
			</app-form-legend>

			<template v-if="!isScheduling">
				<p class="help-block">
					<translate>
						You can set a future date/time that this release will publish.
					</translate>
				</p>

				<p>
					<app-button @click="addSchedule()">
						<translate>Add Schedule</translate>
					</app-button>
				</p>
			</template>
			<template v-else-if="isScheduling && timezones">
				<app-form-group name="scheduled_for_timezone" :label="$gettext(`Timezone`)">
					<p class="help-block">
						<translate>All time selection below will use this timezone.</translate>
					</p>

					<p class="help-block">
						<strong>
							<translate>
								Should auto-detect, but if it doesn't, choose your closest city.
							</translate>
						</strong>
					</p>

					<app-form-control-select>
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
					</app-form-control-select>

					<app-form-control-errors />
				</app-form-group>

				<app-form-group name="scheduled_for" :label="$gettext(`Date and time`)">
					<app-form-control-date
						:timezone-offset="scheduledTimezoneOffset"
						:validators="[validateMinDate(now)]"
					/>
					<app-form-control-errors :label="$gettext(`scheduled for`)" />
				</app-form-group>

				<p class="text-right">
					<app-button trans @click="removeSchedule()">
						<translate>Remove Scheduling</translate>
					</app-button>
				</p>
			</template>
		</fieldset>

		<hr />

		<!--
			The buttons in this template do submit the form through their click handlers.
			We don't use app-form-button because we needed to do some async operations before submitting.
		-->
		<template v-if="model.status !== GameRelease.STATUS_PUBLISHED">
			<app-button
				v-if="isScheduling"
				primary
				solid
				:disabled="!valid || !builds.length"
				@click="saveDraft()"
			>
				<translate>Schedule release</translate>
			</app-button>
			<app-button
				v-else
				primary
				solid
				:disabled="!valid || !builds.length"
				@click="savePublished()"
			>
				<translate>Publish Release</translate>
			</app-button>

			<app-button
				v-if="!isScheduling"
				:disabled="!valid || !builds.length"
				@click="saveDraft()"
			>
				<translate>Save Draft</translate>
			</app-button>
		</template>
		<template v-else>
			<app-button primary solid :disabled="!valid || !builds.length" @click="save()">
				<translate>Save Release</translate>
			</app-button>
		</template>

		<div :class="{ 'pull-right': !Screen.isXs }">
			<br class="visible-xs" />

			<app-button
				v-if="model.status === GameRelease.STATUS_PUBLISHED"
				trans
				@click="unpublish()"
			>
				<translate>Unpublish Release</translate>
			</app-button>

			<app-button trans @click="remove()">
				<translate>Remove Release</translate>
			</app-button>
		</div>
	</app-form>
</template>
