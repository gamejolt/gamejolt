<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../../_common/card/list/item/item.vue';
import { GameScoreTable } from '../../../../../../../../_common/game/score-table/score-table.model';
import { ModalConfirm } from '../../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../_common/route/route-component';
import { AppTooltip } from '../../../../../../../../_common/tooltip/tooltip-directive';
import FormGameScoreTable from '../../../../../../../components/forms/game/score-table/score-table.vue';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

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
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/scores/' + route.params.id),
})
export default class RouteDashGamesManageApiScoreboardsList extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	GameScoreTable = GameScoreTable;

	scoreTables: GameScoreTable[] = [];
	isAdding = false;
	activeItem: GameScoreTable | null = null;

	get currentSort() {
		return this.scoreTables.map(item => item.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Scoreboards for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.scoreTables = GameScoreTable.populate($payload.scoreTables);
	}

	onTableAdded(table: GameScoreTable) {
		this.scoreTables.push(table);
		this.isAdding = false;
	}

	onTableEdited() {
		this.activeItem = null;
	}

	saveSort(tables: GameScoreTable[]) {
		this.scoreTables = tables;
		GameScoreTable.$saveSort(this.game.id, this.currentSort);
	}

	async removeTable(table: GameScoreTable) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.scoreboards.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await table.$remove();

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
			<translate>dash.games.scoreboards.heading</translate>
		</h2>

		<div class="page-help">
			<p>
				<translate>
					The API allows you to add multiple customized scoreboards, with control over
					sorting options and guest scoring, and the ability to attach extra hidden data
					to scores.
				</translate>
			</p>
			<p>
				<translate>
					The primary scoreboard is the one that will show by default on your game's page.
					Set a new primary by dragging a scoreboard into the first slot.
				</translate>
			</p>
			<p>
				<app-link-help page="dev-scoreboards" class="link-help">
					<translate>dash.games.scoreboards.page_help_link</translate>
				</app-link-help>
			</p>
		</div>

		<div class="row">
			<div class="col-md-10 col-lg-9">
				<app-card-list
					:items="scoreTables"
					:active-item="activeItem"
					:is-adding="isAdding"
					is-draggable
					@activate="activeItem = $event"
				>
					<app-card-list-draggable item-key="id" @change="saveSort">
						<template #item="{ element: scoreTable, index }">
							<app-card-list-item :item="scoreTable">
								<!-- Can only remove if there is more than one score table left. -->
								<a
									v-if="scoreTables.length > 1"
									class="card-remove"
									@click.stop="removeTable(scoreTable)"
								>
									<app-jolticon icon="remove" />
								</a>

								<div class="card-stats">
									<div class="stat-big">
										<div class="stat-big-label">
											<translate>
												dash.games.scoreboards.table_id_label
											</translate>
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
											$gettext(`dash.games.scoreboards.primary_tooltip`)
										"
										class="tag tag-highlight"
									>
										<translate>dash.games.scoreboards.primary_tag</translate>
									</span>
									<span
										v-if="scoreTable.allow_guest_scores"
										v-app-tooltip="
											$gettext(`dash.games.scoreboards.guest_tooltip`)
										"
										class="tag"
									>
										<translate>dash.games.scoreboards.guest_tag</translate>
									</span>
									<span
										v-if="scoreTable.unique_scores"
										v-app-tooltip="
											$gettext(`dash.games.scoreboards.unique_tooltip`)
										"
										class="tag"
									>
										<translate>dash.games.scoreboards.unique_tag</translate>
									</span>
									<span
										v-if="
											scoreTable.scores_sorting_direction ===
											GameScoreTable.SORTING_DIRECTION_ASC
										"
										v-app-tooltip="
											$gettext(`dash.games.scoreboards.asc_tooltip`)
										"
										class="tag"
									>
										<translate>dash.games.scoreboards.asc_tag</translate>
									</span>
									<span
										v-if="
											scoreTable.scores_sorting_direction ===
											GameScoreTable.SORTING_DIRECTION_DESC
										"
										v-app-tooltip="
											$gettext(`dash.games.scoreboards.desc_tooltip`)
										"
										class="tag"
									>
										<translate>dash.games.scoreboards.desc_tag</translate>
									</span>
								</div>

								<div class="card-content">
									{{ scoreTable.description }}
								</div>

								<div class="card-controls">
									<!-- Don't propagate the click so that it doesn't open the accordion item. -->
									<app-button
										:to="{
											name: 'dash.games.manage.api.scoreboards.scores.list',
											params: { table: scoreTable.id },
										}"
										@click.stop
									>
										<translate>dash.games.scoreboards.scores_button</translate>
									</app-button>
								</div>

								<template #body>
									<form-game-score-table
										:game="game"
										:model="scoreTable"
										@submit="onTableEdited"
									/>
								</template>
							</app-card-list-item>
						</template>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext(`dash.games.scoreboards.add_button`)"
						@toggle="isAdding = !isAdding"
					>
						<form-game-score-table :game="game" @submit="onTableAdded" />
					</app-card-list-add>
				</app-card-list>
			</div>
		</div>
	</div>
</template>
