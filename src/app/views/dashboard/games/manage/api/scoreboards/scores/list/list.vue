<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameScoreTable } from '../../../../../../../../../_common/game/score-table/score-table.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../../../_common/scroll/scroll.service';
import { UserGameScore } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { useGameDashRouteController } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresList',
	components: {
		AppManageGameListScores,
	},
})
@RouteResolver({
	deps: { params: ['table'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-scores/' +
				route.params.id +
				'/' +
				route.params.table
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresList extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	scoreTables: GameScoreTable[] = [];
	scoreTable: GameScoreTable = null as any;
	selectedTable = 0;
	scores: UserGameScore[] = [];

	get routeTitle() {
		if (this.game && this.scoreTable) {
			return this.$gettextInterpolate(`View Scores for %{ table } - %{ game }`, {
				game: this.game.title,
				table: this.scoreTable.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.scoreTables = GameScoreTable.populate($payload.scoreTables);
		this.scoreTable = new GameScoreTable($payload.scoreTable);
		this.scores = UserGameScore.populate($payload.scores);

		this.selectedTable = this.scoreTables.find(i => i.id === this.scoreTable.id)!.id;
	}

	changeTable() {
		Scroll.shouldAutoScroll = false;
		this.$router.push({
			name: this.$route.name ?? undefined,
			params: Object.assign({}, this.$route.params, {
				table: this.selectedTable,
			}),
		});
		// $state.go($state.current, { table: tableId });
	}

	onScoreRemoved(score: UserGameScore) {
		const index = this.scores.findIndex(i => i.id === score.id);
		if (index !== -1) {
			this.scores.splice(index, 1);
		}
	}
}
</script>

<template>
	<div>
		<h2 class="section-header">
			<translate>dash.games.scores.list.heading</translate>
		</h2>

		<div class="row">
			<div class="col-md-10 col-lg-9">
				<div class="form-group">
					<select v-model="selectedTable" class="form-control" @change="changeTable">
						<option
							v-for="table of scoreTables"
							:key="table.id"
							:selected="table.id === selectedTable"
							:value="table.id"
						>
							{{ table.name }}
						</option>
					</select>
				</div>
			</div>
		</div>

		<div class="page-help">
			<p>
				<translate>
					These are all of the scores that have been submitted to this scoreboard by users
					and guests (if allowed).
				</translate>
			</p>
		</div>

		<div v-if="!scores.length" key="no-scores" class="alert alert-notice anim-fade-in">
			<p><translate>This table lacks scores, alas.</translate></p>
		</div>

		<app-manage-game-list-scores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			@remove="onScoreRemoved"
		/>
	</div>
</template>
