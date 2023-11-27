<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { GameScoreTableModel } from '../../../../../../../../../_common/game/score-table/score-table.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../../../_common/scroll/scroll.service';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import { UserGameScoreModel } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { useGameDashRouteController } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

export default {
	...defineAppRouteOptions({
		deps: { params: ['table'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/developer/games/api/scores/list-table-scores/' +
					route.params.id +
					'/' +
					route.params.table
			),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;
const route = useRoute();
const router = useRouter();

const scoreTables = ref<GameScoreTableModel[]>([]);
const scoreTable = ref<GameScoreTableModel>(null as any);
const selectedTable = ref(0);
const scores = ref<UserGameScoreModel[]>([]);

function changeTable() {
	Scroll.shouldAutoScroll = false;
	router.push({
		name: route.name ?? undefined,
		params: Object.assign({}, route.params, {
			table: selectedTable.value,
		}),
	});
	// $state.go($state.current, { table: tableId });
}

function onScoreRemoved(score: UserGameScoreModel) {
	const index = scores.value.findIndex(i => i.id === score.id);
	if (index !== -1) {
		scores.value.splice(index, 1);
	}
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value && scoreTable.value) {
			return $gettext(`View Scores for %{ table } - %{ game }`, {
				game: game.value!.title,
				table: scoreTable.value.name,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		scoreTables.value = GameScoreTableModel.populate(payload.scoreTables);
		scoreTable.value = new GameScoreTableModel(payload.scoreTable);
		scores.value = UserGameScoreModel.populate(payload.scores);

		selectedTable.value = scoreTables.value.find(i => i.id === scoreTable.value.id)!.id;
	},
});
</script>

<template>
	<div>
		<h2 class="section-header">
			{{ $gettext(`View Scores`) }}
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
				{{
					$gettext(
						`These are all of the scores that have been submitted to this scoreboard by users and guests (if allowed).`
					)
				}}
			</p>
		</div>

		<div v-if="!scores.length" key="no-scores" class="alert alert-notice anim-fade-in">
			<p>{{ $gettext(`This table lacks scores, alas.`) }}</p>
		</div>

		<AppManageGameListScores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			@remove="onScoreRemoved"
		/>
	</div>
</template>
