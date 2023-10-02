<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../../_common/card/list/AppCardListItem.vue';
import {
	$removeGameScoreTable,
	$saveGameScoreTableSort,
	GameScoreTableModel,
	GameScoreTableSorting,
} from '../../../../../../../../_common/game/score-table/score-table.model';
import { showModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../_common/route/legacy-route-component';
import { vAppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import FormGameScoreTable from '../../../../../../../components/forms/game/score-table/score-table.vue';
import { useGameDashRouteController } from '../../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiScoreboardsList',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		FormGameScoreTable,
		AppCardListDraggable,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/scores/' + route.params.id),
})
export default class RouteDashGamesManageApiScoreboardsList extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	GameScoreTable = GameScoreTableModel;

	scoreTables: GameScoreTableModel[] = [];
	isAdding = false;
	activeItem: GameScoreTableModel | null = null;

	readonly DirectionAscend = GameScoreTableSorting.DirectionAsc;
	readonly DirectionDescend = GameScoreTableSorting.DirectionDesc;

	get currentSort() {
		return this.scoreTables.map(item => item.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettext('Manage Scoreboards for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.scoreTables = GameScoreTableModel.populate($payload.scoreTables);
	}

	onTableAdded(table: GameScoreTableModel) {
		this.scoreTables.push(table);
		this.isAdding = false;
	}

	onTableEdited() {
		this.activeItem = null;
	}

	saveSort(tables: GameScoreTableModel[]) {
		this.scoreTables = tables;
		$saveGameScoreTableSort(this.game.id, this.currentSort);
	}

	async removeTable(table: GameScoreTableModel) {
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this scoreboard?')
		);

		if (!result) {
			return;
		}

		await $removeGameScoreTable(table);

		const index = this.scoreTables.findIndex(i => i.id === table.id);
		if (index !== -1) {
			this.scoreTables.splice(index, 1);
		}
	}
}
</script>

<template>
	<div>
		<h2 class="section-header">
			<AppTranslate>Scoreboards</AppTranslate>
		</h2>

		<div class="page-help">
			<p>
				<AppTranslate>
					The API allows you to add multiple customized scoreboards, with control over
					sorting options and guest scoring, and the ability to attach extra hidden data
					to scores.
				</AppTranslate>
			</p>
			<p>
				<AppTranslate>
					The primary scoreboard is the one that will show by default on your game's page.
					Set a new primary by dragging a scoreboard into the first slot.
				</AppTranslate>
			</p>
			<p>
				<AppLinkHelp page="dev-scoreboards" class="link-help">
					<AppTranslate>Learn more about scoreboards...</AppTranslate>
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
											<AppTranslate> Table ID </AppTranslate>
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
										<AppTranslate>Primary Scoreboard</AppTranslate>
									</span>
									<span
										v-if="scoreTable.allow_guest_scores"
										v-app-tooltip="
											$gettext(`Allows guests to save their scores.`)
										"
										class="tag"
									>
										<AppTranslate>Guest Scoring</AppTranslate>
									</span>
									<span
										v-if="scoreTable.unique_scores"
										v-app-tooltip="
											$gettext(`Only displays a user's best score.`)
										"
										class="tag"
									>
										<AppTranslate>Unique Scores</AppTranslate>
									</span>
									<span
										v-if="
											scoreTable.scores_sorting_direction === DirectionAscend
										"
										v-app-tooltip="
											$gettext(
												`Scores with lower values are ranked better/higher.`
											)
										"
										class="tag"
									>
										<AppTranslate
											translate-comment="As in going from lowest to highest"
										>
											Ascending
										</AppTranslate>
									</span>
									<span
										v-if="
											scoreTable.scores_sorting_direction === DirectionDescend
										"
										v-app-tooltip="
											$gettext(
												`Scores with higher values are ranked better/higher.`
											)
										"
										class="tag"
									>
										<AppTranslate
											translate-comment="As in going from lowest to highest"
										>
											Descending
										</AppTranslate>
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
										<AppTranslate>View Scores</AppTranslate>
									</AppButton>
								</div>

								<template #body>
									<FormGameScoreTable
										:game="game"
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
						<FormGameScoreTable :game="game" @submit="onTableAdded" />
					</AppCardListAdd>
				</AppCardList>
			</div>
		</div>
	</div>
</template>
