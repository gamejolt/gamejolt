import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCardListDraggable } from '../../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { AppCardListItem } from '../../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardList } from '../../../../../../../../lib/gj-lib-client/components/card/list/list';
import { GamePackage } from '../../../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Growls } from '../../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Sellable } from '../../../../../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { AppTooltip } from '../../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { arrayIndexBy } from '../../../../../../../../lib/gj-lib-client/utils/array';
import { currency } from '../../../../../../../../lib/gj-lib-client/vue/filters/currency';
import { AppDashGameWizardControls } from '../../../../../../../components/forms/game/wizard-controls/wizard-controls';
import { GamePackageEditModal } from '../../../../../../../components/game/package/edit-modal/edit-modal.service';
import { AppGamePerms } from '../../../../../../../components/game/perms/perms';
import { RouteState, RouteStore } from '../../../manage.store';

@View
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
export default class RouteDashGamesManageGamePackagesList extends BaseRouteComponent {
	@RouteState
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

	@RouteResolve({
		deps: {},
	})
	async routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/packages/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Packages for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
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

	addPackage() {
		GamePackageEditModal.show(this.game);
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
