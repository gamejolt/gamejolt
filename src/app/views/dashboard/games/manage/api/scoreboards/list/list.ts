import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppCardListAdd } from '../../../../../../../../lib/gj-lib-client/components/card/list/add/add';
import { AppCardListDraggable } from '../../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { AppCardListItem } from '../../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardList } from '../../../../../../../../lib/gj-lib-client/components/card/list/list';
import { GameScoreTable } from '../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppTooltip } from '../../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormGameScoreTable } from '../../../../../../../components/forms/game/score-table/score-table';
import { RouteState, RouteStore } from '../../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageApiScoreboardsList',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		AppCardListDraggable,
		AppJolticon,
		FormGameScoreTable,
	},
	directives: {
		AppTooltip,
	},
})
export default class RouteDashGamesManageApiScoreboardsList extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	GameScoreTable = GameScoreTable;

	scoreTables: GameScoreTable[] = [];
	isAdding = false;
	activeItem: GameScoreTable | null = null;

	get currentSort() {
		return this.scoreTables.map(item => item.id);
	}

	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/api/scores/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Scoreboards for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routed($payload: any) {
		this.scoreTables = GameScoreTable.populate($payload.scoreTables);
	}

	onTableAdded(table: GameScoreTable) {
		this.scoreTables.push(table);
		this.isAdding = false;
	}

	onTableEdited() {
		this.activeItem = null;
	}

	saveSort(tables: GameScoreTable[]) {
		this.scoreTables = tables;
		GameScoreTable.$saveSort(this.game.id, this.currentSort);
	}

	async removeTable(table: GameScoreTable) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.scoreboards.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await table.$remove();

		const index = this.scoreTables.findIndex(i => i.id === table.id);
		if (index !== -1) {
			this.scoreTables.splice(index, 1);
		}
	}
}
