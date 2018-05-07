import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./release.html?style=./release.styl';

import { GameRelease } from '../../../../../lib/gj-lib-client/components/game/release/release.model';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmitSuccess,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { GameBuildLaunchOption } from '../../../../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameBuild } from '../build/build';
import { FormGameNewBuild } from '../new-build/new-build';
import { AppCardList } from '../../../../../lib/gj-lib-client/components/card/list/list';
import {
	Timezone,
	TimezoneData,
} from '../../../../../lib/gj-lib-client/components/timezone/timezone.service';
import * as startOfDay from 'date-fns/start_of_day';
import * as addWeeks from 'date-fns/add_weeks';
import { determine } from 'jstimezonedetect';
import { AppFormControlDate } from '../../../../../lib/gj-lib-client/components/form-vue/control/date/date';
import { AppFormLegend } from '../../../../../lib/gj-lib-client/components/form-vue/legend/legend';

type GameReleaseFormModel = GameRelease & {
	should_publish: boolean;
};

@View
@Component({
	components: {
		AppJolticon,
		AppCardList,
		FormGameBuild,
		FormGameNewBuild,
		AppFormControlDate,
		AppFormLegend,
	},
})
export class FormGameRelease extends BaseForm<GameReleaseFormModel>
	implements FormOnInit, FormOnLoad, FormOnSubmitSuccess {
	modelClass = GameRelease as any;

	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(Array) builds: GameBuild[];
	@Prop(Array) launchOptions: GameBuildLaunchOption[];
	@Prop(Object) buildDownloadCounts: { [buildId: number]: number };
	@Prop(Boolean) areBuildsLockedByJam: boolean;
	@Prop(Boolean) areWebBuildsLockedBySellable: boolean;

	$refs: {
		form: AppForm;
	};

	buildForms: FormGameBuild[] = [];
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = null as any;
	now = 0;

	readonly Screen = Screen;
	readonly GameRelease = GameRelease;

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

		Growls.success(
			this.$gettext('dash.games.releases.builds.remove_build_growl'),
			this.$gettext('dash.games.releases.builds.remove_build_growl_title')
		);
	}

	async save() {
		// Save all the managed build forms before saving the release.
		await Promise.all(this.buildForms.filter(i => !i.isDeprecated).map(i => i.save()));
		this.$refs.form.submit();
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

		Growls.success(
			this.$gettext('dash.games.releases.manage.publish_release_growl'),
			this.$gettext('dash.games.releases.manage.publish_release_growl_title')
		);
	}

	saveDraft() {
		this.setField('should_publish', false);
		return this.save();
	}

	unpublish() {
		this.$emit('unpublish-release', this.model);
	}

	remove() {
		this.$emit('remove-release', this.model);
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
	}

	removeSchedule() {
		this.setField('scheduled_for_timezone', null);
		this.setField('scheduled_for', null);
	}

	private async fetchTimezones() {
		// Get timezones list.
		this.timezones = await Timezone.getGroupedTimezones();
		for (let region in this.timezones) {
			for (let tz of this.timezones[region]) {
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
		for (let region in this.timezones) {
			const tz = this.timezones[region].find(_tz => _tz.i === timezone);
			if (tz) {
				return tz;
			}
		}
		return null;
	}
}
