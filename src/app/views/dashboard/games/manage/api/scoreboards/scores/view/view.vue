<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../../_common/api/api.service';
import { formatDate } from '../../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../../_common/filters/number';
import { GameScoreTableModel } from '../../../../../../../../../_common/game/score-table/score-table.model';
import { showModalConfirm } from '../../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import { UserGameScoreModel } from '../../../../../../../../../_common/user/game-score/game-score.model';
import { useGameDashRouteController } from '../../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsScoresView',
})
@OptionsForLegacyRoute({
	deps: { params: ['score'] },
	resolver: ({ route }) =>
		Api.sendRequest(
			'/web/dash/developer/games/api/scores/' + route.params.id + '/' + route.params.score
		),
})
export default class RouteDashGamesManageApiScoreboardsScoresView extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	score: UserGameScoreModel = null as any;
	scoreTable: GameScoreTableModel = null as any;

	readonly formatNumber = formatNumber;
	readonly formatDate = formatDate;

	get routeTitle() {
		if (this.game) {
			return this.$gettext('Score Details - %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.score = new UserGameScoreModel($payload.score);
		this.scoreTable = new GameScoreTableModel($payload.scoreTable);
	}

	async removeScore() {
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this score?')
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
				<AppButton sparse icon="remove" @click="removeScore" />
			</div>

			<AppTranslate>Score Details</AppTranslate>
		</h2>

		<div class="table-responsive">
			<table class="table">
				<colgroup>
					<col class="col-sm-3 col-lg-2" />
				</colgroup>
				<tbody>
					<tr>
						<th>
							<AppTranslate>User</AppTranslate>
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
									<AppTranslate>Guest</AppTranslate>
								</small>
							</span>
						</td>
					</tr>
					<tr>
						<th>
							<AppTranslate translate-comment="Refers to game scoreboard table">
								Table
							</AppTranslate>
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
							<AppTranslate>Score String</AppTranslate>
						</th>
						<td>{{ score.score }}</td>
					</tr>
					<tr>
						<th>
							<AppTranslate>Sort Value</AppTranslate>
						</th>
						<td>{{ formatNumber(score.sort) }}</td>
					</tr>
					<tr>
						<th>
							<AppTranslate>Scored On</AppTranslate>
						</th>
						<td>
							{{ formatDate(score.logged_on, 'medium') }}
						</td>
					</tr>
					<tr>
						<th>
							<AppTranslate>Extra Data</AppTranslate>
						</th>
						<td>
							<pre v-if="score.extra_data" class="small">{{ score.extra_data }}</pre>
							<span v-else class="small text-muted">
								<AppTranslate>
									No extra data for this score. You can use the extra data field
									to store information to help you weed out cheaters and validate
									scores. It's never shown to users.
								</AppTranslate>
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>
