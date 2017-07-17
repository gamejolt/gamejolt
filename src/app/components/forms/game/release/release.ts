import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./release.html?style=./release.styl';

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
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameBuild } from '../build/build';
import { FormGameNewBuild } from '../new-build/new-build';

type GameReleaseFormModel = GameRelease & {
	should_publish: boolean;
};

@View
@Component({
	components: {
		AppJolticon,
		FormGameBuild,
		FormGameNewBuild,
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

	readonly Screen = makeObservableService(Screen);
	readonly GameRelease = GameRelease;

	get loadUrl() {
		return `/web/dash/developer/games/releases/save/${this.game.id}/${this.package.id}`;
	}

	onInit() {
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
}
