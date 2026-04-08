<script lang="ts" setup>
import { formatDate } from '../../../../../../../../_common/filters/date';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import { GameScoreTableModel } from '../../../../../../../../_common/game/score-table/score-table.model';
import AppJolticon from '../../../../../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../../../../_common/popper/AppPopper.vue';
import AppTranslate from '../../../../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../../../../_common/translate/translate.service';
import {
	$removeUserGameScore,
	UserGameScoreModel,
} from '../../../../../../../../_common/user/game-score/game-score.model';

type Props = {
	scoreTable: GameScoreTableModel;
	scores: UserGameScoreModel[];
	isForUser?: boolean;
};

const { scores, isForUser } = defineProps<Props>();

const emit = defineEmits<{
	remove: [score: UserGameScoreModel];
}>();

async function removeScore(score: UserGameScoreModel) {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this score?'));

	if (!result) {
		return;
	}

	await $removeUserGameScore(score);

	emit('remove', score);
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
