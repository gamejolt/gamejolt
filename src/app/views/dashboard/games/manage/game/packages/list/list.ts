import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCardListDraggable from 'game-jolt-frontend-lib/components/card/list/draggable/draggable.vue';
import AppCardListItem from 'game-jolt-frontend-lib/components/card/list/item/item.vue';
import AppCardList from 'game-jolt-frontend-lib/components/card/list/list.vue';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Sellable } from 'game-jolt-frontend-lib/components/sellable/sellable.model';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { arrayIndexBy } from 'game-jolt-frontend-lib/utils/array';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { Component } from 'vue-property-decorator';
import AppDashGameWizardControls from '../../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

@Component({
	name: 'RouteDashGamesManageGamePackagesList',
	components: {
		AppCardList,
		AppCardListDraggable,
		AppCardListItem,
		AppDashGameWizardControls,
		AppGamePerms,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		currency,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/packages/' + route.params.id),
})
export default class RouteDashGamesManageGamePackagesList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	packages: GamePackage[] = [];
	sellables: { [x: number]: Sellable } = {};

	GamePackage = GamePackage;

	get hasAllPerms() {
		return this.game.hasPerms('all');
	}

	get hasBuildsPerms() {
		return this.game.hasPerms('builds');
	}

	get packagesSort() {
		return this.packages.map(i => i.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Packages for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		if ($payload.packages && !$payload.packages.length) {
			if (this.game.hasPerms('all')) {
				this.$router.replace({
					name: 'dash.games.manage.game.packages.add',
					params: {
						id: this.game.id + '',
					},
				});
			}
			this.packages = [];
			this.sellables = {};
			return;
		}

		this.packages = GamePackage.populate($payload.packages);
		this.sellables = arrayIndexBy<Sellable>(
			Sellable.populate($payload.sellables),
			'game_package_id'
		);
	}

	saveSort(packages: GamePackage[]) {
		this.packages = packages;
		GamePackage.$saveSort(this.game.id, this.packagesSort);
	}

	async addPackage() {
		const newPackage = await GamePackageEditModal.show(this.game);
		if (newPackage instanceof GamePackage) {
			this.packages.push(newPackage);
		}
	}

	async removePackage(pkg: GamePackage) {
		const result = await ModalConfirm.show(
			this.$gettext(
				'Are you sure you want to remove this package? All of the releases and builds it contains will be removed as well.'
			)
		);

		if (!result) {
			return;
		}

		await pkg.$remove(this.game);

		Growls.success(
			this.$gettext('The game package has been removed.'),
			this.$gettext('Package Removed')
		);

		// We have to do a refresh since a new package may have been chosen as
		// the primary sellable.
		this.reloadRoute();
	}
}
