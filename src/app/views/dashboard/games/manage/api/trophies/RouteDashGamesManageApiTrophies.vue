<script lang="ts">
import { computed, nextTick, ref } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import AppCardList from '../../../../../../../_common/card/list/AppCardList.vue';
import AppCardListAdd from '../../../../../../../_common/card/list/AppCardListAdd.vue';
import AppCardListDraggable from '../../../../../../../_common/card/list/AppCardListDraggable.vue';
import AppCardListItem from '../../../../../../../_common/card/list/AppCardListItem.vue';
import {
	$removeGameTrophy,
	$saveSortGameTrophy,
	GameTrophyModel,
} from '../../../../../../../_common/game/trophy/trophy.model';
import AppJolticon from '../../../../../../../_common/jolticon/AppJolticon.vue';
import AppLinkHelp from '../../../../../../../_common/link/AppLinkHelp.vue';
import { showModalConfirm } from '../../../../../../../_common/modal/confirm/confirm-service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { Scroll } from '../../../../../../../_common/scroll/scroll.service';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import {
	BaseTrophyDifficulties,
	BaseTrophyDifficulty,
} from '../../../../../../../_common/trophy/base-trophy.model';
import AppTrophyThumbnail from '../../../../../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import FormGameTrophy from '../../../../../../components/forms/game/trophy/trophy.vue';
import { useGameDashRouteController } from '../../manage.store';

const trophyLabels = {
	[BaseTrophyDifficulty.Bronze]: $gettext('Bronze'),
	[BaseTrophyDifficulty.Silver]: $gettext('Silver'),
	[BaseTrophyDifficulty.Gold]: $gettext('Gold'),
	[BaseTrophyDifficulty.Platinum]: $gettext('Platinum'),
};

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: ({ route }) =>
			Api.sendRequest('/web/dash/developer/games/api/trophies/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameDashRouteController()!;

const trophies = ref<GameTrophyModel[]>([]);
const isAdding = ref<{ [x: number]: boolean }>({});
const activeItem = ref<{ [x: number]: GameTrophyModel | undefined }>({});

const groupedTrophies = computed(() => {
	const newTrophies: { [x: number]: GameTrophyModel[] } = {
		[BaseTrophyDifficulty.Bronze]: [],
		[BaseTrophyDifficulty.Silver]: [],
		[BaseTrophyDifficulty.Gold]: [],
		[BaseTrophyDifficulty.Platinum]: [],
	};

	trophies.value.forEach(item => newTrophies[item.difficulty].push(item));

	return newTrophies;
});

const trophySorts = computed(() => ({
	[BaseTrophyDifficulty.Bronze]: getTrophyGroup(BaseTrophyDifficulty.Bronze),
	[BaseTrophyDifficulty.Silver]: getTrophyGroup(BaseTrophyDifficulty.Silver),
	[BaseTrophyDifficulty.Gold]: getTrophyGroup(BaseTrophyDifficulty.Gold),
	[BaseTrophyDifficulty.Platinum]: getTrophyGroup(BaseTrophyDifficulty.Platinum),
}));

const hasHiddenTrophies = computed(() => trophies.value.filter(item => !item.visible).length > 0);

function getTrophyGroup(difficulty: number) {
	const arrayOfTrophies = groupedTrophies.value[difficulty];
	if (Array.isArray(arrayOfTrophies)) {
		return arrayOfTrophies.map(item => item.id);
	}
	return [];
}

async function onTrophyAdded(trophy: GameTrophyModel) {
	// Close all "add" forms.
	resetAdding();
	trophies.value.push(trophy);

	// We want to scroll to the top of the item's position when saving
	// since the form is pretty long. The position may change if they
	// changed the difficulty level, so we let it compile first.
	await nextTick();
	Scroll.to('trophy-container-' + trophy.id);
}

async function onTrophyEdited(trophy: GameTrophyModel) {
	// Close all "edit" forms.
	resetActive();

	// We want to scroll to the top of the item's position when saving since
	// the form is pretty long. The position may change if they changed the
	// difficulty level, so we let angular compile first.
	await nextTick();
	Scroll.to('trophy-container-' + trophy.id);
}

function saveTrophySort(difficulty: BaseTrophyDifficulty, newTrophies: GameTrophyModel[]) {
	// Pull out the trophies and then add them back in in the correct order.
	const trophyIds = newTrophies.map(i => i.id);
	const filtered = trophies.value.filter(i => trophyIds.indexOf(i.id) === -1).concat(newTrophies);

	// Replace with new sort.
	trophies.value.splice(0, trophies.value.length, ...filtered);

	$saveSortGameTrophy(game.value!.id, difficulty, trophySorts.value[difficulty]);
}

async function removeTrophy(trophy: GameTrophyModel) {
	const result = await showModalConfirm($gettext('Are you sure you want to remove this trophy?'));

	if (!result) {
		return;
	}

	await $removeGameTrophy(trophy);

	const index = trophies.value.findIndex(item => item.id === trophy.id);
	if (index !== -1) {
		trophies.value.splice(index, 1);
	}
}

function resetAdding() {
	isAdding.value = {
		[BaseTrophyDifficulty.Bronze]: false,
		[BaseTrophyDifficulty.Silver]: false,
		[BaseTrophyDifficulty.Gold]: false,
		[BaseTrophyDifficulty.Platinum]: false,
	};
}

function resetActive() {
	activeItem.value = {
		[BaseTrophyDifficulty.Bronze]: undefined,
		[BaseTrophyDifficulty.Silver]: undefined,
		[BaseTrophyDifficulty.Gold]: undefined,
		[BaseTrophyDifficulty.Platinum]: undefined,
	};
}

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext('Manage Trophies for %{ game }', {
				game: game.value.title,
			});
		}
		return null;
	}),
	onInit() {
		resetActive();
		resetAdding();
	},
	onResolved({ payload }) {
		trophies.value = GameTrophyModel.populate(payload.trophies);
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-10 col-lg-9">
			<h2 class="section-header">
				{{ $gettext(`Game Trophies`) }}
			</h2>

			<div class="page-help">
				<p>
					{{
						$gettext(
							`The API lets you add multiple unique trophies, each forged from a material that indicates how difficult it is to achieve: bronze (easiest), silver, gold, or platinum (hardest).`
						)
					}}
				</p>
				<p>
					<AppLinkHelp page="dev-trophies" class="link-help">
						{{ $gettext(`Learn more about trophies...`) }}
					</AppLinkHelp>
				</p>
			</div>

			<div v-if="hasHiddenTrophies" class="alert alert-notice">
				<p>
					<strong>{{ $gettext(`You have hidden trophies!`) }}</strong>

					{{ $gettext(` `) }}

					{{
						$gettext(
							`Be sure to unhide them when you're ready for players to achieve them.`
						)
					}}
				</p>
			</div>

			<div v-for="difficulty of BaseTrophyDifficulties" :key="difficulty">
				<h4>
					{{
						$gettext(`%{ difficulty } Trophies`, {
							difficulty: trophyLabels[difficulty],
						})
					}}
				</h4>

				<p v-if="!groupedTrophies[difficulty].length" class="text-muted small">
					{{ $gettext(` No trophies added yet for this difficulty level. `) }}
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
													{{ $gettext(` Trophy ID `) }}
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
												{{ $gettext(` Hidden `) }}
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
												{{ $gettext(` Secret `) }}
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
