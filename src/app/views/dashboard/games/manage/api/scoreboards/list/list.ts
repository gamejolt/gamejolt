import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';
import { RouteResolve } from '../../../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { GameScoreTable } from '../../../../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { RouteState, RouteStore } from '../../../manage.state';
import { AppCardList } from '../../../../../../../../lib/gj-lib-client/components/card/list/list';
import { AppCardListItem } from '../../../../../../../../lib/gj-lib-client/components/card/list/item/item';
import { AppCardListAdd } from '../../../../../../../../lib/gj-lib-client/components/card/list/add/add';
import { AppCardListDraggable } from '../../../../../../../../lib/gj-lib-client/components/card/list/draggable/draggable';
import { AppJolticon } from '../../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { FormGameScoreTable } from '../../../../../../../components/forms/game/score-table/score-table';

@View
@Component({
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
export default class RouteDashGamesManageApiScoreboardsList extends Vue {
	@RouteState game: RouteStore['game'];

	GameScoreTable = GameScoreTable;

	scoreTables: GameScoreTable[] = [];
	isAdding = false;
	activeItem: GameScoreTable | null = null;

	get currentSort() {
		return this.scoreTables.map(item => item.id);
	}

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/developer/games/api/scores/' + route.params.id);
	}

	routed() {
		Meta.title = this.$gettextInterpolate('Manage Scoreboards for %{ game }', {
			game: this.game.title,
		});

		this.scoreTables = GameScoreTable.populate(this.$payload.scoreTables);
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
