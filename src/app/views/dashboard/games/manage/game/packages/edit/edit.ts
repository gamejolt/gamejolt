import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppGamePackageCard from 'game-jolt-frontend-lib/components/game/package/card/card.vue';
import { GamePackagePayloadModel } from 'game-jolt-frontend-lib/components/game/package/package-payload.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { GameRelease } from 'game-jolt-frontend-lib/components/game/release/release.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import AppNavTabList from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list.vue';
import { AppProgressPoller } from 'game-jolt-frontend-lib/components/progress/poller/poller';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Sellable } from 'game-jolt-frontend-lib/components/sellable/sellable.model';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import FormGamePackage from '../../../../../../../components/forms/game/package/package.vue';
import AppDashGameWizardControls from '../../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

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
