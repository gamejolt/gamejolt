<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameScoreTableModel } from '../../../../../../../../../_common/game/score-table/score-table.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import { Scroll } from '../../../../../../../../../_common/scroll/scroll.service';
import { UserGameScoreModel } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { useGameDashRouteController } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresList',
	components: {
		AppManageGameListScores,
	},
})
@OptionsForLegacyRoute({
	deps: { params: ['table'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/list-table-scores/' +
				route.params.id +
				'/' +
				route.params.table
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresList extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	scoreTables: GameScoreTableModel[] = [];
	scoreTable: GameScoreTableModel = null as any;
	selectedTable = 0;
	scores: UserGameScoreModel[] = [];

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
		this.scoreTables = GameScoreTableModel.populate($payload.scoreTables);
		this.scoreTable = new GameScoreTableModel($payload.scoreTable);
		this.scores = UserGameScoreModel.populate($payload.scores);

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

	onScoreRemoved(score: UserGameScoreModel) {
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
			<AppTranslate>View Scores</AppTranslate>
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
				<AppTranslate>
					These are all of the scores that have been submitted to this scoreboard by users
					and guests (if allowed).
				</AppTranslate>
			</p>
		</div>

		<div v-if="!scores.length" key="no-scores" class="alert alert-notice anim-fade-in">
			<p><AppTranslate>This table lacks scores, alas.</AppTranslate></p>
		</div>

		<AppManageGameListScores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			@remove="onScoreRemoved"
		/>
	</div>
</template>
