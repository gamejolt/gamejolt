<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Api } from '../../../../../../../../../_common/api/api.service';
import AppButton from '../../../../../../../../../_common/button/AppButton.vue';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { GameScoreTableModel } from '../../../../../../../../../_common/game/score-table/score-table.model';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../../../../_common/translate/translate.service';
import {
	$removeUserGameScore,
	UserGameScoreModel,
} from '../../../../../../../../../_common/user/game-score/game-score.model';
import { useGameDashRouteController } from '../../../../manage.store';

export default {
	...defineAppRouteOptions({
		reloadOn: { params: ['table', 'score'] },
		resolver: ({ route }) =>
			Api.sendRequest(
				'/web/dash/developer/games/api/scores/' + route.params.id + '/' + route.params.score
			),
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();
const { game } = useGameDashRouteController()!;

const score = ref<UserGameScoreModel>(null as any);
const scoreTable = ref<GameScoreTableModel>(null as any);

async function removeScore() {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this score?'));

	if (!result) {
		return;
	}

	await $removeUserGameScore(score.value);

	router.push({
		name: 'dash.games.manage.api.scoreboards.scores.list',
		params: {
			table: score.value.table_id + '',
		},
	});
}

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Score Details - %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		score.value = new UserGameScoreModel(payload.score);
		scoreTable.value = new GameScoreTableModel(payload.scoreTable);
	},
});
</script>

<template>
	<div v-if="isBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<AppButton sparse icon="remove" @click="removeScore" />
			</div>

			{{ $gettext(`Score Details`) }}
		</h2>

		<div class="table-responsive">
			<table class="table">
				<colgroup>
					<col class="col-sm-3 col-lg-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							{{ $gettext(`User`) }}
						</th>
						<td>
							<!-- User Score -->
							<RouterLink
								v-if="score.user_id"
								:to="{
									name: 'dash.games.manage.api.scoreboards.scores.user',
									params: { table: score.table_id, user: score.user.id },
								}"
							>
								{{ score.user.display_name }}
							</RouterLink>

							<!-- Guest Score -->
							<span v-else>
								{{ score.guest }}
								<br />
								<small class="text-muted">
									{{ $gettext(`Guest`) }}
								</small>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Table`) }}
						</th>
						<td>
							<RouterLink
								:to="{
									name: 'dash.games.manage.api.scoreboards.scores.list',
									params: { table: scoreTable.id },
								}"
							>
								{{ scoreTable.name }}
							</RouterLink>
						</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Score String`) }}
						</th>
						<td>{{ score.score }}</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Sort Value`) }}
						</th>
						<td>{{ formatNumber(score.sort) }}</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Scored On`) }}
						</th>
						<td>
							{{ formatDate(score.logged_on, 'medium') }}
						</td>
					</tr>
					<tr>
						<th>
							{{ $gettext(`Extra Data`) }}
						</th>
						<td>
							<pre v-if="score.extra_data" class="small">{{ score.extra_data }}</pre>
							<span v-else class="small text-muted">
								{{
									$gettext(
										`No extra data for this score. You can use the extra data field to store information to help you weed out cheaters and validate scores. It's never shown to users.`
									)
								}}
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
