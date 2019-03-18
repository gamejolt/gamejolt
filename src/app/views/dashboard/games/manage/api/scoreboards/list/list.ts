import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCardListAdd from 'game-jolt-frontend-lib/components/card/list/add/add.vue';
import AppCardListDraggable from 'game-jolt-frontend-lib/components/card/list/draggable/draggable.vue';
import AppCardListItem from 'game-jolt-frontend-lib/components/card/list/item/item.vue';
import AppCardList from 'game-jolt-frontend-lib/components/card/list/list.vue';
import { GameScoreTable } from 'game-jolt-frontend-lib/components/game/score-table/score-table.model';
import { ModalConfirm } from 'game-jolt-frontend-lib/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';
import FormGameScoreTable from '../../../../../../../components/forms/game/score-table/score-table.vue';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

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
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/scores/' + route.params.id),
})
export default class RouteDashGamesManageApiScoreboardsList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	GameScoreTable = GameScoreTable;

	scoreTables: GameScoreTable[] = [];
	isAdding = false;
	activeItem: GameScoreTable | null = null;

	get currentSort() {
		return this.scoreTables.map(item => item.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Scoreboards for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
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
