<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/AppCardListItem.vue';
import { GameTrophy } from '../../../../../../../_common/game/trophy/trophy.model';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { vAppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';
import { TrophyDifficulty } from '../../../../../../../_common/trophy/base-trophy.model';
import AppTrophyThumbnail from '../../../../../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import FormGameTrophy from '../../../../../../components/forms/game/trophy/trophy.vue';
import { useGameDashRouteController } from '../../manage.store';

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
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/dash/developer/games/api/trophies/' + route.params.id),
})
export default class RouteDashGamesManageApiTrophies extends LegacyRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

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
			[GameTrophy.DIFFICULTY_BRONZE]: this.$gettext('Bronze'),
			[GameTrophy.DIFFICULTY_SILVER]: this.$gettext('Silver'),
			[GameTrophy.DIFFICULTY_GOLD]: this.$gettext('Gold'),
			[GameTrophy.DIFFICULTY_PLATINUM]: this.$gettext('Platinum'),
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
		const result = await showModalConfirm(
			this.$gettext('Are you sure you want to remove this trophy?')
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
				<AppTranslate>Game Trophies</AppTranslate>
			</h2>

			<div class="page-help">
				<p>
					<AppTranslate>
						The API lets you add multiple unique trophies, each forged from a material
						that indicates how difficult it is to achieve: bronze (easiest), silver,
						gold, or platinum (hardest).
					</AppTranslate>
				</p>
				<p>
					<AppLinkHelp page="dev-trophies" class="link-help">
						<AppTranslate>Learn more about trophies...</AppTranslate>
					</AppLinkHelp>
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
					<AppTranslate :translate-params="{ difficulty: trophyLabels[difficulty] }">
						%{ difficulty } Trophies
					</AppTranslate>
				</h4>

				<p v-if="!groupedTrophies[difficulty].length" class="text-muted small">
					<AppTranslate> No trophies added yet for this difficulty level. </AppTranslate>
				</p>

				<AppCardList
					:items="groupedTrophies[difficulty]"
					:active-item="activeItem[difficulty]"
					:is-adding="isAdding[difficulty]"
					is-draggable
					@activate="activeItem[difficulty] = $event"
				>
					<AppCardListDraggable
						item-key="id"
						@change="saveTrophySort(difficulty, $event)"
					>
						<template #item="{ element: trophy }">
							<AppCardListItem :id="`trophy-container-${trophy.id}`" :item="trophy">
								<div class="row">
									<div class="col-xs-6 col-xs-offset-3 col-sm-2 col-sm-offset-0">
										<AppTrophyThumbnail :trophy="trophy" no-highlight />

										<br class="visible-xs" />
									</div>
									<div class="col-xs-12 col-sm-10">
										<a class="card-remove" @click.stop="removeTrophy(trophy)">
											<AppJolticon icon="remove" />
										</a>

										<div class="card-stats">
											<div class="stat-big">
												<div class="stat-big-label">
													<AppTranslate> Trophy ID </AppTranslate>
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
													$gettext(
														`Trophies that are hidden will only appear on the site for you, the developer, for testing purposes.`
													)
												"
												class="tag tag-notice"
											>
												<AppTranslate> Hidden </AppTranslate>
											</span>
											<span
												v-if="trophy.secret"
												v-app-tooltip="
													$gettext(
														`Making a trophy secret hides everything but its name until it is achieved.`
													)
												"
												class="tag"
											>
												<AppTranslate> Secret </AppTranslate>
											</span>
										</div>
									</div>
								</div>

								<template #body>
									<FormGameTrophy
										:game="game"
										:model="trophy"
										@submit="onTrophyEdited"
									/>
								</template>
							</AppCardListItem>
						</template>
					</AppCardListDraggable>

					<AppCardListAdd
						:label="$gettext('New Trophy')"
						@toggle="isAdding[difficulty] = !isAdding[difficulty]"
					>
						<FormGameTrophy
							:game="game"
							:difficulty="difficulty"
							@submit="onTrophyAdded"
						/>
					</AppCardListAdd>
				</AppCardList>
			</div>
		</div>
	</div>
</template>
