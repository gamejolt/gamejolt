<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { GameScoreTable } from '../../../../../../../../../_common/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../../_common/route/route-component';
import { UserGameScore } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { useGameDashRouteController } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresView',
})
@RouteResolver({
	deps: { params: ['score'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/' + route.params.id + '/' + route.params.score
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresView extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	score: UserGameScore = null as any;
	scoreTable: GameScoreTable = null as any;

	readonly formatNumber = formatNumber;
	readonly formatDate = formatDate;

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Score Details - %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.score = new UserGameScore($payload.score);
		this.scoreTable = new GameScoreTable($payload.scoreTable);
	}

	async removeScore() {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.scores.view.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await this.score.$remove();

		this.$router.push({
			name: 'dash.games.manage.api.scoreboards.scores.list',
			params: {
				table: this.score.table_id + '',
			},
		});
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<h2 class="section-header">
			<div class="section-header-controls">
				<app-button sparse icon="remove" @click="removeScore" />
			</div>

			<translate>dash.games.scores.view.heading</translate>
		</h2>

		<div class="table-responsive">
			<table class="table">
				<colgroup>
					<col class="col-sm-3 col-lg-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							<translate>dash.games.scores.view.user_label</translate>
						</th>
						<td>
							<!-- User Score -->
							<router-link
								v-if="score.user_id"
								:to="{
									name: 'dash.games.manage.api.scoreboards.scores.user',
									params: { table: score.table_id, user: score.user.id },
								}"
							>
								{{ score.user.display_name }}
							</router-link>

							<!-- Guest Score -->
							<span v-else>
								{{ score.guest }}
								<br />
								<small class="text-muted">
									<translate>dash.games.scores.guest_tag</translate>
								</small>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.table_label</translate>
						</th>
						<td>
							<router-link
								:to="{
									name: 'dash.games.manage.api.scoreboards.scores.list',
									params: { table: scoreTable.id },
								}"
							>
								{{ scoreTable.name }}
							</router-link>
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.string_label</translate>
						</th>
						<td>{{ score.score }}</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.sort_label</translate>
						</th>
						<td>{{ formatNumber(score.sort) }}</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.date_label</translate>
						</th>
						<td>
							{{ formatDate(score.logged_on, 'medium') }}
						</td>
					</tr>
					<tr>
						<th>
							<translate>dash.games.scores.view.data_label</translate>
						</th>
						<td>
							<pre v-if="score.extra_data" class="small">{{ score.extra_data }}</pre>
							<span v-else class="small text-muted">
								<translate>dash.games.scores.view.data_none_help</translate>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
