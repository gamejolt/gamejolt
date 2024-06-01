<script lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
import {
	$removeAllUserScoresFromGameScoreTable,
	GameScoreTableModel,
} from '../../../../../../../../../_common/game/score-table/score-table.model';
import { showSuccessGrowl } from '../../../../../../../../../_common/growls/growls.service';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { vAppTooltip } from '../../../../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import { UserGameScoreModel } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { UserModel } from '../../../../../../../../../_common/user/user.model';
import { useGameDashRouteController } from '../../../../manage.store';
import AppManageGameListScores from '../../_list-scores/list-scores.vue';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['table', 'user'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/developer/games/api/scores/list-table-user-scores/' +
					route.params.id +
					'/' +
					route.params.table +
					'/' +
					route.params.user
			),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;
const router = useRouter();

const user = ref<UserModel>(null as any);
const scoreTable = ref<GameScoreTableModel>(null as any);
const scores = ref<UserGameScoreModel[]>([]);

function onScoreRemoved(score: UserGameScoreModel) {
	const index = scores.value.findIndex(i => i.id === score.id);
	if (index !== -1) {
		scores.value.splice(index, 1);
	}
}

async function removeAll() {
	const result = await showModalConfirm(
		$gettext(`Are you sure you want to remove all of the user's scores from this scoreboard?`)
	);

	if (!result) {
		return;
	}

	await $removeAllUserScoresFromGameScoreTable(scoreTable.value, user.value.id);

	showSuccessGrowl(
		$gettext(`All of the user's scores have been removed from the scoreboard.`),
		$gettext(`Scores Removed`)
	);

	router.push({
		name: 'dash.games.manage.api.scoreboards.scores.list',
		params: {
			table: scoreTable.value.id + '',
		},
	});
}

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		if (game.value && user.value && scoreTable.value) {
			return $gettext('View Scores for %{ user } on %{ table } - %{ game }', {
				game: game.value.title,
				user: user.value.display_name,
				table: scoreTable.value.name,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		user.value = new UserModel(payload.user);
		scoreTable.value = new GameScoreTableModel(payload.scoreTable);
		scores.value = UserGameScoreModel.populate(payload.scores);
	},
});
</script>

<template>
	<div v-if="isBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<AppButton
					v-app-tooltip="$gettext(`Remove All Scores`)"
					sparse
					icon="remove"
					@click="removeAll"
				/>
			</div>

			<!--
				TODO: this translation block is horrible but im not sure
				how we want to solve it. Can we avoid splitting it to like 5 lines while
				keeping the router links somehow.
			-->
			{{ $gettext(`View scores`) }}
			{{ ' ' }}
			<small>
				{{ $gettext(`for user`) }}
				{{ ' ' }}
				<RouterLink class="link-unstyled" :to="user.url">
					<strong>{{ user.display_name }}</strong>
				</RouterLink>
				{{ ' ' }}
				{{ $gettext(`on table`) }}
				{{ ' ' }}
				<RouterLink
					class="link-unstyled"
					:to="{
						name: 'dash.games.manage.api.scoreboards.scores.list',
						params: { table: scoreTable.id },
					}"
				>
					<strong>{{ scoreTable.name }}</strong>
				</RouterLink>
			</small>
		</h2>

		<div v-if="!scores.length" class="alert alert-notice anim-fade-in">
			<p>
				{{ $gettext(`The user has no scores on this scoreboard.`) }}
			</p>
		</div>

		<AppManageGameListScores
			v-if="scores.length"
			:score-table="scoreTable"
			:scores="scores"
			is-for-user
			@remove="onScoreRemoved"
		/>
	</div>
</template>
