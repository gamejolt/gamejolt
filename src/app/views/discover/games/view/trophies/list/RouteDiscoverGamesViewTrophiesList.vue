<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GameTrophyModel } from '../../../../../../../_common/game/trophy/trophy.model';
import AppNavTabList from '../../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../../_common/translate/translate.service';
import AppTrophyCompletion from '../../../../../../../_common/trophy/AppTrophyCompletion.vue';
import AppTrophyList from '../../../../../../../_common/trophy/list/AppTrophyList.vue';
import {
	UserGameTrophyModel,
	indexAchievedGameTrophies,
} from '../../../../../../../_common/user/trophy/game-trophy.model';
import { useGameRouteController } from '../../RouteDiscoverGamesView.vue';

export default {
	...defineAppRouteOptions({
		cache: true,
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest('/web/discover/games/trophies/' + route.params.id),
	}),
};
</script>

<script lang="ts" setup>
const { game } = useGameRouteController()!;
const { user } = useCommonStore();

const trophies = ref<GameTrophyModel[]>([]);
const achieved = ref<UserGameTrophyModel[]>([]);
const experience = ref(0);
const showInvisibleTrophyMessage = ref(false);

let achievedIndexed: any = null;
const filteredTrophies = ref<any>({
	achieved: [],
	unachieved: [],
});

const currentFilter = ref('all');

createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			return $gettext(`Trophies for %{ game }`, {
				game: game.value.title,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		trophies.value = GameTrophyModel.populate(payload.trophies);
		achieved.value = payload.trophiesAchieved
			? UserGameTrophyModel.populate(payload.trophiesAchieved)
			: [];
		experience.value = payload.trophiesExperienceAchieved || 0;
		showInvisibleTrophyMessage.value = payload.trophiesShowInvisibleTrophyMessage || false;

		achievedIndexed = indexAchievedGameTrophies(achieved.value);
		filteredTrophies.value = GameTrophyModel.splitAchieved(trophies.value, achievedIndexed);

		currentFilter.value = 'all';
	},
});
</script>

<template>
	<div>
		<section class="section">
			<div class="container">
				<h2 class="section-header">
					{{ $gettext(`Trophies`) }}
				</h2>

				<div class="row">
					<div class="col-sm-10 col-md-9 col-lg-5 col-lg-push-7">
						<AppTrophyCompletion
							v-if="user"
							:total="trophies.length"
							:achieved="achieved.length"
							:experience="experience"
						/>
					</div>
					<div class="col-sm-10 col-md-9 col-lg-7 col-lg-pull-5">
						<AppNavTabList v-if="filteredTrophies.achieved.length">
							<ul>
								<li>
									<a
										:class="{ active: currentFilter === 'all' }"
										@click="currentFilter = 'all'"
									>
										{{ $gettext(`All`) }}
										<span class="badge hidden-xs">
											{{ formatNumber(trophies.length) }}
										</span>
									</a>
								</li>
								<li>
									<a
										:class="{ active: currentFilter === 'achieved' }"
										@click="currentFilter = 'achieved'"
									>
										{{ $gettext(`Achieved`) }}
										<span class="badge hidden-xs">
											{{
												' ' + formatNumber(filteredTrophies.achieved.length)
											}}
										</span>
									</a>
								</li>
								<li>
									<a
										:class="{ active: currentFilter === 'unachieved' }"
										@click="currentFilter = 'unachieved'"
									>
										{{ $gettext(`Not Achieved`) }}
										<span class="badge hidden-xs">
											{{ formatNumber(filteredTrophies.unachieved.length) }}
										</span>
									</a>
								</li>
							</ul>
						</AppNavTabList>

						<div v-if="showInvisibleTrophyMessage" class="alert alert-notice">
							{{
								$gettext(
									`Some trophies may be invisible to players. You're seeing them because you're the developer.`
								)
							}}
						</div>

						<AppTrophyList
							:trophies="
								currentFilter === 'all' ? trophies : filteredTrophies[currentFilter]
							"
							:achieved="achieved"
						/>
					</div>
				</div>
			</div>
		</section>

		<section v-if="!trophies.length" class="section fill-offset">
			<div class="container text-center">
				{{
					$gettext(
						`There are no trophies for this game yet. Bug the developer about adding some!`
					)
				}}
			</div>
		</section>
	</div>
</template>
