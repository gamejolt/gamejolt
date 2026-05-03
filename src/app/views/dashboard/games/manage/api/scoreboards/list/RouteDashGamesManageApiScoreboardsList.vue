<script lang="ts">
import { computed, ref } from 'vue';

import FormGameScoreTable from '~app/components/forms/game/score-table/FormGameScoreTable.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppCardList from '~common/card/list/AppCardList.vue';
import AppCardListAdd from '~common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '~common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '~common/card/list/AppCardListItem.vue';
import {
	$removeGameScoreTable,
	$saveGameScoreTableSort,
	GameScoreTableModel,
} from '~common/game/score-table/score-table.model';
import {
	GameScoreTableSortingDirectionAsc,
	GameScoreTableSortingDirectionDesc,
} from '~common/game/score-table/score-table.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/api/scores/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const scoreTables = ref<GameScoreTableModel[]>([]);
const isAdding = ref(false);
const activeItem = ref<GameScoreTableModel>();

const currentSort = computed(() => scoreTables.value.map(item => item.id));

function onTableAdded(table: GameScoreTableModel) {
	scoreTables.value.push(table);
	isAdding.value = false;
}

function onTableEdited() {
	activeItem.value = undefined;
}

function saveSort(tables: GameScoreTableModel[]) {
	scoreTables.value = tables;
	$saveGameScoreTableSort(game.value!.id, currentSort.value);
}

async function removeTable(table: GameScoreTableModel) {
	const result = await showModalConfirm(
		$gettext('Are you sure you want to remove this scoreboard?')
	);

	if (!result) {
		return;
	}

	await $removeGameScoreTable(table);

	const index = scoreTables.value.findIndex(i => i.id === table.id);
	if (index !== -1) {
		scoreTables.value.splice(index, 1);
	}
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Manage Scoreboards for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		scoreTables.value = GameScoreTableModel.populate(payload.scoreTables);
	},
});
</script>

<template>
	<div>
		<h2 class="section-header">
			{{ $gettext(`Scoreboards`) }}
		</h2>

		<div class="page-help">
			<p>
				{{
					$gettext(
						`The API allows you to add multiple customized scoreboards, with control over sorting options and guest scoring, and the ability to attach extra hidden data to scores.`
					)
				}}
			</p>
			<p>
				{{
					$gettext(
						`The primary scoreboard is the one that will show by default on your game's page. Set a new primary by dragging a scoreboard into the first slot.`
					)
				}}
			</p>
			<p>
				<AppLinkHelp page="dev-scoreboards" class="link-help">
					{{ $gettext(`Learn more about scoreboards...`) }}
				</AppLinkHelp>
			</p>
		</div>

		<div class="row">
			<div class="col-md-10 col-lg-9">
				<AppCardList
					:items="scoreTables"
					:active-item="activeItem"
					:is-adding="isAdding"
					is-draggable
					@activate="activeItem = $event"
				>
					<AppCardListDraggable item-key="id" @change="saveSort">
						<template #item="{ element: scoreTable, index }">
							<AppCardListItem :item="scoreTable">
								<!-- Can only remove if there is more than one score table left. -->
								<a
									v-if="scoreTables.length > 1"
									class="card-remove"
									@click.stop="removeTable(scoreTable)"
								>
									<AppJolticon icon="remove" />
								</a>

								<div class="card-stats">
									<div class="stat-big">
										<div class="stat-big-label">
											{{ $gettext(` Table ID `) }}
										</div>
										<div class="stat-big-digit">{{ scoreTable.id }}</div>
									</div>
								</div>

								<div class="card-title">
									<h4>
										{{ scoreTable.name }}
									</h4>
								</div>

								<div class="card-meta">
									<span
										v-if="index === 0"
										v-app-tooltip="
											$gettext(
												`The primary scoreboard is displayed on your game page by default. If your game's API library doesn't support multiple scoreboards, all scores will be submitted to the primary scoreboard.`
											)
										"
										class="tag tag-highlight"
									>
										{{ $gettext(`Primary Scoreboard`) }}
									</span>
									<span
										v-if="scoreTable.allow_guest_scores"
										v-app-tooltip="
											$gettext(`Allows guests to save their scores.`)
										"
										class="tag"
									>
										{{ $gettext(`Guest Scoring`) }}
									</span>
									<span
										v-if="scoreTable.unique_scores"
										v-app-tooltip="
											$gettext(`Only displays a user's best score.`)
										"
										class="tag"
									>
										{{ $gettext(`Unique Scores`) }}
									</span>
									<span
										v-if="
											scoreTable.scores_sorting_direction ===
											GameScoreTableSortingDirectionAsc
										"
										v-app-tooltip="
											$gettext(
												`Scores with lower values are ranked better/higher.`
											)
										"
										class="tag"
									>
										{{ $gettext(`Ascending`) }}
									</span>
									<span
										v-if="
											scoreTable.scores_sorting_direction ===
											GameScoreTableSortingDirectionDesc
										"
										v-app-tooltip="
											$gettext(
												`Scores with higher values are ranked better/higher.`
											)
										"
										class="tag"
									>
										{{ $gettext(`Descending`) }}
									</span>
								</div>

								<div class="card-content">
									{{ scoreTable.description }}
								</div>

								<div class="card-controls">
									<!-- Don't propagate the click so that it doesn't open the accordion item. -->
									<AppButton
										:to="{
											name: 'dash.games.manage.api.scoreboards.scores.list',
											params: { table: scoreTable.id },
										}"
										@click.stop
									>
										{{ $gettext(`View Scores`) }}
									</AppButton>
								</div>

								<template #body>
									<FormGameScoreTable
										:game="game!"
										:model="scoreTable"
										@submit="onTableEdited"
									/>
								</template>
							</AppCardListItem>
						</template>
					</AppCardListDraggable>

					<AppCardListAdd
						:label="$gettext(`Add Scoreboard`)"
						@toggle="isAdding = !isAdding"
					>
						<FormGameScoreTable :game="game!" @submit="onTableAdded" />
					</AppCardListAdd>
				</AppCardList>
			</div>
		</div>
	</div>
</template>
