import View from '!view!./edit.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCard } from '../../../../../../../../lib/gj-lib-client/components/card/card';
import { AppExpand } from '../../../../../../../../lib/gj-lib-client/components/expand/expand';
import { AppGamePackageCard } from '../../../../../../../../lib/gj-lib-client/components/game/package/card/card';
import { GamePackagePayloadModel } from '../../../../../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { GamePackage } from '../../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../../../../../../../lib/gj-lib-client/components/game/release/release.model';
import { Growls } from '../../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { AppNavTabList } from '../../../../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppProgressPoller } from '../../../../../../../../lib/gj-lib-client/components/progress/poller/poller';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Sellable } from '../../../../../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { AppTimeAgo } from '../../../../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppTooltip } from '../../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppLoading } from '../../../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { number } from '../../../../../../../../lib/gj-lib-client/vue/filters/number';
import { FormGamePackage } from '../../../../../../../components/forms/game/package/package';
import { AppDashGameWizardControls } from '../../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageGamePackagesEdit',
	components: {
		AppTimeAgo,
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
@RouteResolver({
	deps: { params: ['packageId'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/packages/' + route.params.id + '/' + route.params.packageId
		),
})
export default class RouteDashGamesManageGamePackagesEdit extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	package: GamePackage = null as any;
	sellable: Sellable = null as any;
	releases: GameRelease[] = [];

	previewPackage: GamePackage | null = null;
	previewSellable: Sellable | null = null;
	previewData: GamePackagePayloadModel | null = null;
	buildsProcessingCount = 0;
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

	get routeTitle() {
		if (this.game && this.package) {
			return this.$gettextInterpolate(`Edit Package %{ package } - %{ game }`, {
				game: this.game.title,
				package: this.package.title || this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.package = new GamePackage($payload.package);
		this.sellable = new Sellable($payload.sellable);
		this.releases = GameRelease.populate($payload.releases);

		this.previewData = null;
		this.previewPackage = null;

		this.loadPreview();
	}

	async loadPreview() {
		this.isLoadingPreview = true;

		const response = await Api.sendRequest(
			'/web/dash/developer/games/packages/preview/' +
				this.package.game_id +
				'/' +
				this.package.id,
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

	async editPackage() {
		// Keep our preview in sync.
		await GamePackageEditModal.show(this.game, this.package, this.sellable);
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
