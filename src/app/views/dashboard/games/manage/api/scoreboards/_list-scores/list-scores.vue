<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import { GameScoreTable } from '../../../../../../../../_common/game/score-table/score-table.model';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../_common/popper/AppPopper.vue';
import { UserGameScore } from '../../../../../../../../_common/user/game-score/game-score.model';

@Options({
	components: {
		AppPopper,
	},
})
export default class AppManageGameListScores extends Vue {
	@Prop(Object) scoreTable!: GameScoreTable;
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Boolean) isForUser?: boolean;

	@Emit('remove')
	emitRemove(_score: UserGameScore) {}

	readonly formatDate = formatDate;
	readonly formatNumber = formatNumber;

	async removeScore(score: UserGameScore) {
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this score?')
		);

		if (!result) {
			return;
		}

		await score.$remove();

		this.emitRemove(score);
	}
}
</script>

<template>
	<div class="table-responsive">
		<table class="table table-condensed">
			<thead>
				<tr>
					<th v-if="!isForUser">
						<AppTranslate translate-comment="As in placement">Rank</AppTranslate>
					</th>
					<th>
						<AppTranslate>Score</AppTranslate>
					</th>
					<th v-if="!isForUser">
						<AppTranslate>User</AppTranslate>
					</th>
					<th>
						<AppTranslate>Date</AppTranslate>
					</th>
					<th />
				</tr>
			</thead>
			<tbody>
				<tr v-for="(score, i) of scores" :key="score.id">
					<td v-if="!isForUser">
						<strong>{{ i + 1 }}</strong>
					</td>
					<td>
						<router-link
							:to="{
								name: 'dash.games.manage.api.scoreboards.scores.view',
								params: { score: score.id },
							}"
							class="table-primary-link"
						>
							{{ formatNumber(score.sort) }}
						</router-link>
					</td>
					<td v-if="!isForUser">
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
					<td class="small">
						{{ formatDate(score.logged_on, 'medium') }}
					</td>
					<td class="text-right">
						<div class="table-controls">
							<AppPopper popover-class="fill-darkest">
								<a class="text-muted">
									<AppJolticon icon="ellipsis-h" />
								</a>

								<template #popover>
									<div class="list-group list-group-dark nowrap">
										<a
											class="list-group-item has-icon"
											@click="removeScore(score)"
										>
											<AppJolticon icon="remove" notice />
											<AppTranslate> Remove Score </AppTranslate>
										</a>
									</div>
								</template>
							</AppPopper>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
