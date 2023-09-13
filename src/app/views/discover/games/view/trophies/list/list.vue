<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../../../_common/filters/number';
import { GameTrophyModel } from '../../../../../../../_common/game/trophy/trophy.model';
import AppNavTabList from '../../../../../../../_common/nav/tab-list/tab-list.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../../../_common/store/common-store';
import AppTrophyCompletion from '../../../../../../../_common/trophy/AppTrophyCompletion.vue';
import AppTrophyList from '../../../../../../../_common/trophy/list/AppTrophyList.vue';
import {
	UserGameTrophyModel,
	indexAchievedGameTrophies,
} from '../../../../../../../_common/user/trophy/game-trophy.model';
import { useGameRouteController } from '../../view.vue';

@Options({
	name: 'RouteDiscoverGamesViewTrophiesList',
	components: {
		AppTrophyCompletion,
		AppTrophyList,
		AppNavTabList,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/discover/games/trophies/' + route.params.id),
})
export default class RouteDiscoverGamesViewTrophiesList extends LegacyRouteComponent {
	routeStore = setup(() => useGameRouteController()!);
	commonStore = setup(() => useCommonStore());

	trophies: GameTrophyModel[] = [];
	achieved: UserGameTrophyModel[] = [];
	experience = 0;
	showInvisibleTrophyMessage = false;

	achievedIndexed: any = null;
	filteredTrophies: any = {
		achieved: [],
		unachieved: [],
	};

	currentFilter = 'all';

	readonly formatNumber = formatNumber;

	get routeTitle() {
		if (this.game) {
			return this.$gettext(`Trophies for %{ game }`, {
				game: this.game.title,
			});
		}
		return null;
	}

	get game() {
		return this.routeStore.game;
	}

	get app() {
		return this.commonStore;
	}

	routeResolved($payload: any) {
		this.trophies = GameTrophyModel.populate($payload.trophies);
		this.achieved = $payload.trophiesAchieved
			? UserGameTrophyModel.populate($payload.trophiesAchieved)
			: [];
		this.experience = $payload.trophiesExperienceAchieved || 0;
		this.showInvisibleTrophyMessage = $payload.trophiesShowInvisibleTrophyMessage || false;

		this.achievedIndexed = indexAchievedGameTrophies(this.achieved);
		this.filteredTrophies = GameTrophyModel.splitAchieved(this.trophies, this.achievedIndexed);

		this.currentFilter = 'all';
	}
}
</script>

<template>
	<div>
		<section class="section">
			<div class="container">
				<h2 class="section-header">
					<AppTranslate>Trophies</AppTranslate>
				</h2>

				<div class="row">
					<div class="col-sm-10 col-md-9 col-lg-5 col-lg-push-7">
						<AppTrophyCompletion
							v-if="app.user"
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
										<AppTranslate>All</AppTranslate>
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
										<AppTranslate
											translate-comment="As in trophies that are achieved"
										>
											Achieved
										</AppTranslate>
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
										<AppTranslate>Not Achieved</AppTranslate>
										<span class="badge hidden-xs">
											{{ formatNumber(filteredTrophies.unachieved.length) }}
										</span>
									</a>
								</li>
							</ul>
						</AppNavTabList>

						<div v-if="showInvisibleTrophyMessage" class="alert alert-notice">
							<AppTranslate>
								Some trophies may be invisible to players. You're seeing them
								because you're the developer.
							</AppTranslate>
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
				<AppTranslate>
					There are no trophies for this game yet. Bug the developer about adding some!
				</AppTranslate>
			</div>
		</section>
	</div>
</template>
