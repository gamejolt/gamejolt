<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { GameModel } from '../../../../../_common/game/game.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import AppTimelineList from '../../../../../_common/timeline-list/AppTimelineList.vue';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/AppTimelineListItem.vue';
import { showTrophyModal } from '../../../../../_common/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import { UserGameTrophyModel } from '../../../../../_common/user/trophy/game-trophy.model';
import { UserSiteTrophyModel } from '../../../../../_common/user/trophy/site-trophy.model';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { numberSort } from '../../../../../utils/array';
import { useProfileRouteStore } from '../../RouteProfile.vue';

type TrophyEntry = {
	gameId?: number;
	game?: GameModel;
	trophies: UserBaseTrophyModel[];
};

@Options({
	name: 'RouteProfileTrophiesOverview',
	components: {
		AppTimelineList,
		AppTimelineListItem,
		AppTimeAgo,
		AppTrophyThumbnail,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/profile/trophies/overview/@' + route.params.username),
})
export default class RouteProfileTrophiesOverview extends LegacyRouteComponent {
	routeStore = setup(() => useProfileRouteStore()!);
	commonStore = setup(() => useCommonStore());

	trophyEntries: TrophyEntry[] = [];

	canLoadMore = false;
	isLoadingMore = false;
	pageSize?: number;

	get user() {
		return this.routeStore.user;
	}

	get app() {
		return this.commonStore;
	}

	get routeTitle() {
		if (this.user) {
			return this.$gettext(`@%{ user }'s Trophy Case`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get hasTrophies() {
		return this.trophyEntries.length > 0;
	}

	get isDev() {
		return this.app.user && this.app.user.is_developer;
	}

	get isLoggedInUser() {
		return this.user && this.app.user && this.app.user.id === this.user.id;
	}

	routeResolved(payload: any) {
		this.pageSize = payload.pageSize;

		let trophies: UserBaseTrophyModel[] = [];
		if (payload.trophies) {
			trophies = populateTrophies(payload.trophies);
		}

		if (trophies.length === 0) {
			this.canLoadMore = false;
		} else {
			for (const userTrophy of trophies) {
				this.insertTrophy(userTrophy);
			}
			this.sortEntries();
			this.updateCanLoadMore(trophies);
		}
	}

	/**
	 * Group the trophies into feed entries:
	 * Each entry is a group of trophies of the same origin (same game or site).
	 * It also creates a new entry if the difference between achieved trophies is larger than 24 hours.
	 */
	private insertTrophy(userTrophy: UserBaseTrophyModel) {
		// Set the game/id for this user trophy (undefined for site trophies)
		let game: GameModel | undefined = undefined;
		let gameId: number | undefined = undefined;
		if (userTrophy instanceof UserGameTrophyModel) {
			game = userTrophy.game;
			gameId = userTrophy.game_id;
		}
		// Find the previous entry for that game
		let entry = this.trophyEntries
			.slice()
			.reverse()
			.find(i => i.gameId === gameId);
		// If we have a previous entry, either append the trophy,
		// or if the entry was too long ago (more than 24 hours), unset the entry to create a new one afterwards.
		if (entry) {
			const firstTrophy = entry.trophies[0];
			if (Math.abs(firstTrophy.logged_on - userTrophy.logged_on) > 24 * 60 * 60 * 1000) {
				entry = undefined;
			} else {
				entry.trophies.push(userTrophy);
			}
		}
		// Create a new entry if none exist for this game/trophy
		if (!entry) {
			entry = { game, gameId, trophies: [userTrophy] };
			this.trophyEntries.push(entry);
		}
	}

	private updateCanLoadMore(loadedTrophies: UserBaseTrophyModel[]) {
		// We have to receive a page size from the api to be able to load more.
		if (!this.pageSize) {
			this.canLoadMore = false;
			return;
		}

		// When we have less than the page size in new trophies for both game AND site trophies,
		// we know there are no new trophies to load at all.
		const loadedGameTrophies = loadedTrophies.filter(i => i instanceof UserGameTrophyModel);
		const loadedSiteTrophies = loadedTrophies.filter(i => i instanceof UserSiteTrophyModel);
		if (
			loadedGameTrophies.length < this.pageSize &&
			loadedSiteTrophies.length < this.pageSize
		) {
			this.canLoadMore = false;
			return;
		}

		const allTrophies = this.trophyEntries.flatMap(i => i.trophies);
		const gameTrophies = allTrophies.filter(i => i instanceof UserGameTrophyModel);
		const siteTrophies = allTrophies.filter(i => i instanceof UserSiteTrophyModel);

		// For either trophy type:
		// When we have more than 0 new trophies and more than 0 total,
		// and the total number of trophies are divisible by the page size,
		// we can assume that there are more trophies to load.
		// This would show the load more button if there are exactly 0 new trophies to load,
		// but in that case it would load no new trophies and the above condition would hide the button afterwards.
		this.canLoadMore =
			(loadedGameTrophies.length > 0 &&
				gameTrophies.length > 0 &&
				gameTrophies.length % this.pageSize === 0) ||
			(loadedSiteTrophies.length > 0 &&
				siteTrophies.length > 0 &&
				siteTrophies.length % this.pageSize === 0);
	}

	private sortEntries() {
		this.trophyEntries = this.trophyEntries.sort((a, b) =>
			numberSort(b.trophies[0].logged_on, a.trophies[0].logged_on)
		);
	}

	onClickTrophy(userTrophy: UserBaseTrophyModel) {
		showTrophyModal(userTrophy);
	}

	async onClickShowMore() {
		if (!this.user || !this.canLoadMore) {
			return;
		}

		this.isLoadingMore = true;

		let url = '/web/profile/trophies/overview/@' + this.user.username;

		// Find the oldest game and site trophy to use as scroll
		let oldestGameTrophy: UserGameTrophyModel | null = null,
			oldestSiteTrophy: UserSiteTrophyModel | null = null;

		const allTrophies = this.trophyEntries.flatMap(i => i.trophies);

		for (const userTrophy of allTrophies) {
			if (userTrophy instanceof UserGameTrophyModel) {
				if (!oldestGameTrophy || oldestGameTrophy.logged_on > userTrophy.logged_on) {
					oldestGameTrophy = userTrophy;
				}
			} else if (userTrophy instanceof UserSiteTrophyModel) {
				if (!oldestSiteTrophy || oldestSiteTrophy.logged_on > userTrophy.logged_on) {
					oldestSiteTrophy = userTrophy;
				}
			}
		}

		if (oldestGameTrophy) {
			url += `?game-scroll=${oldestGameTrophy.logged_on}`;
		}
		if (oldestSiteTrophy) {
			url += oldestGameTrophy ? '&' : '?';
			url += `site-scroll=${oldestSiteTrophy.logged_on}`;
		}

		const payload = await Api.sendRequest(url);

		let trophies: UserBaseTrophyModel[] = [];
		if (payload.trophies) {
			trophies = populateTrophies(payload.trophies);
		}

		if (trophies.length === 0) {
			this.canLoadMore = false;
		} else {
			for (const userTrophy of trophies) {
				this.insertTrophy(userTrophy);
			}
			this.sortEntries();
			this.updateCanLoadMore(trophies);
		}

		this.isLoadingMore = false;
	}
}
</script>

<template>
	<div>
		<div v-if="!hasTrophies" class="alert alert-info">
			<span>
				<AppTranslate>This user has not achieved any trophies ... yet.</AppTranslate>
			</span>
		</div>

		<AppTimelineList v-else>
			<div v-for="entry of trophyEntries" :key="entry.trophies[0].key">
				<AppTimelineListItem>
					<template #bubble>
						<div class="-timeline-icon">
							<AppJolticon v-if="entry.game" icon="trophy" />
							<AppJolticon v-else icon="gamejolt" />
						</div>
					</template>

					<div>
						<div class="timeline-list-item-title">
							<template v-if="entry.game">
								<template v-if="entry.trophies.length === 1">
									Achieved 1 trophy for the game
									<router-link
										:to="{
											name: 'profile.trophies.game',
											params: {
												id: entry.game.id,
											},
										}"
									>
										{{ entry.game.title }}
									</router-link>
								</template>
								<template v-else>
									Achieved {{ entry.trophies.length }} trophies for the game
									<router-link
										:to="{
											name: 'profile.trophies.game',
											params: {
												id: entry.game.id,
											},
										}"
									>
										{{ entry.game.title }}
									</router-link>
								</template>
							</template>
							<template v-else>
								<template v-if="entry.trophies.length === 1">
									Achieved 1
									<router-link :to="{ name: 'profile.trophies.site' }">
										Game Jolt Trophy
									</router-link>
								</template>
								<template v-else>
									Achieved {{ entry.trophies.length }}
									<router-link :to="{ name: 'profile.trophies.site' }">
										Game Jolt Trophies
									</router-link>
								</template>
							</template>
						</div>
					</div>

					<div class="timeline-list-item-meta">
						<AppTimeAgo :date="entry.trophies[0].logged_on" />
					</div>

					<div class="timeline-list-item-details">
						<div class="timeline-list-item-content">
							<AppTrophyThumbnail
								v-for="userTrophy of entry.trophies"
								:key="userTrophy.id"
								class="-trophy-thumb"
								:trophy="userTrophy.trophy"
								:no-highlight="isLoggedInUser"
								@click="onClickTrophy(userTrophy)"
							/>
						</div>
					</div>
				</AppTimelineListItem>
				<div class="timeline-list-item-split" />
			</div>
			<p>
				<AppButton v-if="canLoadMore" :disabled="isLoadingMore" @click="onClickShowMore">
					<AppTranslate>Show More</AppTranslate>
				</AppButton>
				<router-link
					:to="{
						name: 'profile.trophies.all',
					}"
				>
					<AppButton>
						<AppTranslate>View all trophies</AppTranslate>
					</AppButton>
				</router-link>
			</p>
			<p v-if="isDev" class="-dev-trophy-link small">
				<AppLinkHelp page="dev-trophies" class="link-help">
					<AppTranslate>Learn how to integrate trophies into YOUR game!</AppTranslate>
				</AppLinkHelp>
			</p>
		</AppTimelineList>
	</div>
</template>

<style lang="stylus" scoped>
.-level-widget
	max-width: 340px
	width: 100%
	margin-right: 20px

.-trophy-header
	margin-bottom: 4px

.-dev-trophy-link
	margin-bottom: 24px

// Used to center the icon
::v-deep(.timeline-list-item-bubble-inner)
.timeline-list-item-bubble-inner > div
	position: relative
	height: 100%

.-timeline-icon
	display: flex
	position: relative
	height: 100%
	justify-content: center
	align-items: center

.-trophy-thumb
	display: inline-block
	width: 80px
	margin-right: 10px
	margin-bottom: 10px
	cursor: pointer

.-exp
	display: flex

	@media $media-xs
		flex-direction: column

		.-level-widget
			margin: 0
</style>
