import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./release.html';
import { GameRelease } from '../../../../../lib/gj-lib-client/components/game/release/release.model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { GameBuildLaunchOption } from '../../../../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormOnSubmitSuccess } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameBuild } from '../build/build';
import { FormGameNewBuild } from '../new-build/new-build';

type GameReleaseFormModel = GameRelease & {
	should_publish: boolean;
};

@View
@Component({
	components: {
		AppFormLoader,
		AppJolticon,
		FormGameBuild,
		FormGameNewBuild,
	},
})
export class FormGameRelease extends BaseForm<GameReleaseFormModel>
	implements FormOnInit, FormOnSubmitSuccess {
	modelClass = GameRelease as any;

	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(Array) builds: GameBuild[];
	@Prop(Array) launchOptions: GameBuildLaunchOption[];
	@Prop(Object) buildDownloadCounts: { [buildId: number]: number };
	@Prop(Boolean) areBuildsLockedByJam: boolean;
	@Prop(Boolean) areWebBuildsLockedBySellable: boolean;

	buildForms: FormGameBuild[] = [];

	readonly Screen = makeObservableService(Screen);
	readonly GameRelease = GameRelease;

	onInit() {
		this.setField('game_id', this.game.id);
		this.setField('game_package_id', this.package.id);

		if (!this.builds) {
			this.builds = [];
		}

		if (!this.launchOptions) {
			this.launchOptions = [];
		}
	}

	onLoaded(payload: any) {
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
	 * When launch options are modified for a build, we need to merge the changes back into
	 * the global array of them.
	 **/
	updateBuildLaunchOptions(build: GameBuild, launchOptions: GameBuildLaunchOption[]) {
		// Remove old ones for build.
		if (this.launchOptions && this.launchOptions.length) {
			arrayRemove(this.launchOptions, launchOption => launchOption.game_build_id === build.id);
		}

		// If no new ones, skip.
		if (!launchOptions || !launchOptions.length) {
			return;
		}

		// Add the new ones into the global list.
		this.launchOptions = this.launchOptions.concat(GameBuildLaunchOption.populate(launchOptions));
	}

	onBuildEdited(build: GameBuild, response: any) {
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
		const buildFormSavePromises: Promise<any>[] = [];
		for (let buildForm of this.buildForms) {
			if (!buildForm.isDeprecated) {
				continue;
			}
			buildFormSavePromises.push(buildForm.save());
		}

		await Promise.all(buildFormSavePromises);
		const form: AppForm = this.$refs['form'] as any;
		return form.submit();
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
		this.$emit('unpuslish-release', this.model);
	}

	remove() {
		this.$emit('remove-release', this.model);
	}

	onSubmitSuccess(response: any) {
		if (this.game) {
			this.game.assign(response.game);
		}
	}
}
