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
