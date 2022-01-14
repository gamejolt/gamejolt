<script lang="ts">
import { nextTick } from 'vue';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardListAdd from '../../../../../../../_common/card/list/add/add.vue';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/item/item.vue';
import { GameTrophy } from '../../../../../../../_common/game/trophy/trophy.model';
import { ModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { TrophyDifficulty } from '../../../../../../../_common/trophy/base-trophy.model';
import FormGameTrophy from '../../../../../../components/forms/game/trophy/trophy.vue';
import AppTrophyThumbnail from '../../../../../../components/trophy/thumbnail/thumbnail.vue';
import { RouteStore, RouteStoreModule } from '../../manage.store';

@Options({
	name: 'RouteDashGamesManageApiTrophies',
	components: {
		AppCardList,
		AppCardListItem,
		AppCardListAdd,
		AppTrophyThumbnail,
		FormGameTrophy,
		AppCardListDraggable,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/trophies/' + route.params.id),
})
export default class RouteDashGamesManageApiTrophies extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	trophies: GameTrophy[] = [];
	isAdding: { [x: number]: boolean } = {};
	activeItem: { [x: number]: GameTrophy | null } = {};

	GameTrophy = GameTrophy;

	get groupedTrophies() {
		const trophies: { [x: number]: GameTrophy[] } = {
			[GameTrophy.DIFFICULTY_BRONZE]: [],
			[GameTrophy.DIFFICULTY_SILVER]: [],
			[GameTrophy.DIFFICULTY_GOLD]: [],
			[GameTrophy.DIFFICULTY_PLATINUM]: [],
		};

		this.trophies.forEach(item => trophies[item.difficulty].push(item));

		return trophies;
	}

	get trophyLabels() {
		return {
			[GameTrophy.DIFFICULTY_BRONZE]: this.$gettext('trophies.bronze'),
			[GameTrophy.DIFFICULTY_SILVER]: this.$gettext('trophies.silver'),
			[GameTrophy.DIFFICULTY_GOLD]: this.$gettext('trophies.gold'),
			[GameTrophy.DIFFICULTY_PLATINUM]: this.$gettext('trophies.platinum'),
		};
	}

	get trophySorts() {
		return {
			[GameTrophy.DIFFICULTY_BRONZE]: this.getTrophyGroup(GameTrophy.DIFFICULTY_BRONZE),
			[GameTrophy.DIFFICULTY_SILVER]: this.getTrophyGroup(GameTrophy.DIFFICULTY_SILVER),
			[GameTrophy.DIFFICULTY_GOLD]: this.getTrophyGroup(GameTrophy.DIFFICULTY_GOLD),
			[GameTrophy.DIFFICULTY_PLATINUM]: this.getTrophyGroup(GameTrophy.DIFFICULTY_PLATINUM),
		};
	}

	get hasHiddenTrophies() {
		return this.trophies.filter(item => !item.visible).length > 0;
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Manage Trophies for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	routeCreated() {
		this.resetActive();
		this.resetAdding();
	}

	routeResolved($payload: any) {
		this.trophies = GameTrophy.populate($payload.trophies);
	}

	private getTrophyGroup(difficulty: number) {
		return this.groupedTrophies[difficulty].map(item => item.id);
	}

	async onTrophyAdded(trophy: GameTrophy) {
		// Close all "add" forms.
		this.resetAdding();
		this.trophies.push(trophy);

		// We want to scroll to the top of the item's position when saving
		// since the form is pretty long. The position may change if they
		// changed the difficulty level, so we let it compile first.
		await nextTick();
		Scroll.to('trophy-container-' + trophy.id);
	}

	async onTrophyEdited(trophy: GameTrophy) {
		// Close all "edit" forms.
		this.resetActive();

		// We want to scroll to the top of the item's position when saving since
		// the form is pretty long. The position may change if they changed the
		// difficulty level, so we let angular compile first.
		await nextTick();
		Scroll.to('trophy-container-' + trophy.id);
	}

	saveTrophySort(difficulty: TrophyDifficulty, trophies: GameTrophy[]) {
		// Pull out the trophies and then add them back in in the correct order.
		const trophyIds = trophies.map(i => i.id);
		const filtered = this.trophies.filter(i => trophyIds.indexOf(i.id) === -1).concat(trophies);

		// Replace with new sort.
		this.trophies.splice(0, this.trophies.length, ...filtered);

		GameTrophy.$saveSort(this.game.id, difficulty, this.trophySorts[difficulty]);
	}

	async removeTrophy(trophy: GameTrophy) {
		const result = await ModalConfirm.show(
			this.$gettext('dash.games.trophies.remove_confirmation')
		);

		if (!result) {
			return;
		}

		await trophy.$remove();

		const index = this.trophies.findIndex(item => item.id === trophy.id);
		if (index !== -1) {
			this.trophies.splice(index, 1);
		}
	}

	private resetAdding() {
		this.isAdding = {
			[GameTrophy.DIFFICULTY_BRONZE]: false,
			[GameTrophy.DIFFICULTY_SILVER]: false,
			[GameTrophy.DIFFICULTY_GOLD]: false,
			[GameTrophy.DIFFICULTY_PLATINUM]: false,
		};
	}

	private resetActive() {
		this.activeItem = {
			[GameTrophy.DIFFICULTY_BRONZE]: null,
			[GameTrophy.DIFFICULTY_SILVER]: null,
			[GameTrophy.DIFFICULTY_GOLD]: null,
			[GameTrophy.DIFFICULTY_PLATINUM]: null,
		};
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-10 col-lg-9">
			<h2 class="section-header">
				<translate>dash.games.trophies.heading</translate>
			</h2>

			<div class="page-help">
				<p>
					<translate>
						The API lets you add multiple unique trophies, each forged from a material
						that indicates how difficult it is to achieve: bronze (easiest), silver,
						gold, or platinum (hardest).
					</translate>
				</p>
				<p>
					<app-link-help page="dev-trophies" class="link-help">
						<translate>dash.games.trophies.page_help_link</translate>
					</app-link-help>
				</p>
			</div>

			<div v-if="hasHiddenTrophies" class="alert alert-notice">
				<p v-translate>
					<strong>You have hidden trophies!</strong>
					Be sure to unhide them when you're ready for players to achieve them.
				</p>
			</div>

			<div v-for="difficulty of GameTrophy.difficulties" :key="difficulty">
				<h4>
					<translate :translate-params="{ difficulty: trophyLabels[difficulty] }">
						%{ difficulty } Trophies
					</translate>
				</h4>

				<p v-if="!groupedTrophies[difficulty].length" class="text-muted small">
					<translate> No trophies added yet for this difficulty level. </translate>
				</p>

				<app-card-list
					:items="groupedTrophies[difficulty]"
					:active-item="activeItem[difficulty]"
					:is-adding="isAdding[difficulty]"
					is-draggable
					@activate="activeItem[difficulty] = $event"
				>
					<app-card-list-draggable
						item-key="id"
						@change="saveTrophySort(difficulty, $event)"
					>
						<template #item="{ element: trophy }">
							<app-card-list-item
								:id="`trophy-container-${trophy.id}`"
								:item="trophy"
							>
								<div class="row">
									<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
										<app-trophy-thumbnail :trophy="trophy" no-highlight />

										<br class="visible-xs" />
									</div>
									<div class="col-xs-12 col-sm-10">
										<a class="card-remove" @click.stop="removeTrophy(trophy)">
											<app-jolticon icon="remove" />
										</a>

										<div class="card-stats">
											<div class="stat-big">
												<div class="stat-big-label">
													<translate>
														dash.games.trophies.trophy_id_label
													</translate>
												</div>
												<div class="stat-big-digit">
													{{ trophy.id }}
												</div>
											</div>
										</div>

										<div class="card-title">
											<h5>{{ trophy.title }}</h5>
										</div>

										<div class="card-content">
											{{ trophy.description }}
										</div>

										<div
											v-if="!trophy.visible || trophy.secret"
											class="card-meta"
										>
											<span
												v-if="!trophy.visible"
												v-app-tooltip="
													$gettext(`dash.games.trophies.hidden_tooltip`)
												"
												class="tag tag-notice"
											>
												<translate>
													dash.games.trophies.hidden_tag
												</translate>
											</span>
											<span
												v-if="trophy.secret"
												v-app-tooltip="
													$gettext(`dash.games.trophies.secret_tooltip`)
												"
												class="tag"
											>
												<translate>
													dash.games.trophies.secret_tag
												</translate>
											</span>
										</div>
									</div>
								</div>

								<template #body>
									<form-game-trophy
										:game="game"
										:model="trophy"
										@submit="onTrophyEdited"
									/>
								</template>
							</app-card-list-item>
						</template>
					</app-card-list-draggable>

					<app-card-list-add
						:label="$gettext('New Trophy')"
						@toggle="isAdding[difficulty] = !isAdding[difficulty]"
					>
						<form-game-trophy
							:game="game"
							:difficulty="difficulty"
							@submit="onTrophyAdded"
						/>
					</app-card-list-add>
				</app-card-list>
			</div>
		</div>
	</div>
</template>
