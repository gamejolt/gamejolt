<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatDate } from '../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import { GameScoreTable } from '../../../../../../../../_common/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../_common/popper/popper.vue';
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
		const result = await ModalConfirm.show(
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
						<translate>dash.games.scores.list.rank_label</translate>
					</th>
					<th>
						<translate>Score</translate>
					</th>
					<th v-if="!isForUser">
						<translate>dash.games.scores.list.user_label</translate>
					</th>
					<th>
						<translate>dash.games.scores.list.date_label</translate>
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
								<translate>dash.games.scores.guest_tag</translate>
							</small>
						</span>
					</td>
					<td class="small">
						{{ formatDate(score.logged_on, 'medium') }}
					</td>
					<td class="text-right">
						<div class="table-controls">
							<app-popper popover-class="fill-darkest">
								<a class="text-muted">
									<app-jolticon icon="cog" />
								</a>

								<template #popover>
									<div class="list-group list-group-dark nowrap">
										<a
											class="list-group-item has-icon"
											@click="removeScore(score)"
										>
											<app-jolticon icon="remove" notice />
											<translate>
												dash.games.scores.list.remove_button
											</translate>
										</a>
									</div>
								</template>
							</app-popper>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
