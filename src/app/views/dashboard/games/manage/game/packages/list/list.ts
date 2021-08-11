import { Options } from 'vue-property-decorator';
import { arrayIndexBy } from '../../../../../../../../utils/array';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCardListDraggable from '../../../../../../../../_common/card/list/draggable/draggable.vue';
import AppCardListItem from '../../../../../../../../_common/card/list/item/item.vue';
import AppCardList from '../../../../../../../../_common/card/list/list.vue';
import { currency } from '../../../../../../../../_common/filters/currency';
import { GamePackage } from '../../../../../../../../_common/game/package/package.model';
import { Growls } from '../../../../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../_common/route/route-component';
import { Sellable } from '../../../../../../../../_common/sellable/sellable.model';
import { AppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import AppDashGameWizardControls from '../../../../../../../components/forms/game/wizard-controls/wizard-controls.vue';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

@Options({
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
