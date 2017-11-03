import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./edit.html';

import { GamePackage } from '../../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../../../../../lib/gj-lib-client/components/game/release/release.model';
import { Sellable } from '../../../../../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { RouteState, RouteStore } from '../../../manage.store';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { GamePackagePayloadModel } from '../../../../../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { Growls } from '../../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppNavTabList } from '../../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppGamePackageCard } from '../../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { AppCard } from '../../../../../../../../lib/gj-lib-client/components/card/card';
import { AppTooltip } from '../../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../../../../../lib/gj-lib-client/vue/filters/number';
import { FormGamePackage } from '../../../../../../../components/forms/game/package/package';
import { AppExpand } from '../../../../../../../../lib/gj-lib-client/components/expand/expand';
import { AppDashGameWizardControls } from '../../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { AppProgressPoller } from '../../../../../../../../lib/gj-lib-client/components/progress/poller/poller';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashGamesManageGamePackagesEdit',
	components: {
		AppJolticon,
		AppNavTabList,
		AppLoading,
		AppGamePackageCard,
		AppCard,
		AppExpand,
		FormGamePackage,
		AppDashGameWizardControls,
		AppProgressPoller,
		AppGamePerms,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashGamesManageGamePackagesEdit extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	package: GamePackage = null as any;
	sellable: Sellable = null as any;
	releases: GameRelease[] = [];

	previewPackage: GamePackage | null = null;
	previewSellable: Sellable | null = null;
	previewData: GamePackagePayloadModel | null = null;
	buildsProcessingCount = 0;
	isShowingPackageEdit = false;
	isLoadingPreview = false;
	isAddingRelease = false;

	GamePackage = GamePackage;
	GameRelease = GameRelease;
	number = number;

	get hasBuildsPerms() {
		return this.game && this.game.hasPerms('builds');
	}

	get hasAnalyticsPerms() {
		return this.game && this.game.hasPerms('analytics');
	}

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/dash/developer/games/packages/' + route.params.id + '/' + route.params.packageId
		);
	}

	get routeTitle() {
		if (this.game && this.package) {
			return this.$gettextInterpolate(`Edit Package %{ package } - %{ game }`, {
				game: this.game.title,
				package: this.package.title || this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
		this.package = new GamePackage($payload.package);
		this.sellable = new Sellable($payload.sellable);
		this.releases = GameRelease.populate($payload.releases);

		this.previewData = null;
		this.previewPackage = null;
		this.isShowingPackageEdit = false;

		this.loadPreview();
	}

	async loadPreview() {
		this.isLoadingPreview = true;

		const response = await Api.sendRequest(
			'/web/dash/developer/games/packages/preview/' + this.package.game_id + '/' + this.package.id,
			null,
			{ detach: true }
		);

		// We pull all new stuff for the preview so that we don't step on the form.
		this.previewData = new GamePackagePayloadModel(response);
		this.previewSellable = response.sellable ? new Sellable(response.sellable) : null;
		this.previewPackage = this.previewData.packages.find(i => i.id === this.package.id) || null;
		this.buildsProcessingCount = response.buildsProcessingCount || 0;
		this.isLoadingPreview = false;

		// Clear out any "bought" status in the sellable so it always shows as if we haven't bought it yet.
		if (this.previewSellable) {
			this.previewSellable.is_owned = false;
		}
	}

	onBuildsProcessed(response: any) {
		this.loadPreview();

		if (response.game) {
			this.game.assign(response.game);
		}
	}

	onEdited() {
		this.loadPreview();
	}

	async newRelease() {
		this.isAddingRelease = true;

		try {
			const response = await Api.sendRequest(
				'/web/dash/developer/games/releases/create-stub/' +
					this.package.game_id +
					'/' +
					this.package.id,
				{},
				{ detach: true }
			);

			this.$router.push({
				name: 'dash.games.manage.game.packages.release.edit',
				params: {
					packageId: this.package.id + '',
					releaseId: response.newReleaseId + '',
				},
			});
		} catch (e) {
			Growls.error(this.$gettext(`Could not create new release.`));
			this.isAddingRelease = false;
		}
	}

	async removeRelease(release: GameRelease) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.releases.manage.remove_release_confirmation')
		);

		if (!result) {
			return;
		}

		await release.$remove(this.game);

		Growls.success(
			this.$gettext('dash.games.releases.manage.remove_release_growl'),
			this.$gettext('dash.games.releases.manage.remove_release_growl_title')
		);

		const index = this.releases.findIndex(i => i.id === release.id);
		if (index !== -1) {
			this.releases.splice(index, 1);
		}
	}
}
