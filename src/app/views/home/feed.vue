<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Provide } from 'vue-property-decorator';
import { router } from '..';
import { numberSort } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import { shallowSetup } from '../../../utils/vue';
import { trackExperimentEngagement } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import { configHomeNav } from '../../../_common/config/config.service';
import { AppConfigLoaded } from '../../../_common/config/loaded';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import AppNavTabList from '../../../_common/nav/tab-list/tab-list.vue';
import {
	asyncRouteLoader,
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import AppScrollAffix from '../../../_common/scroll/AppScrollAffix.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { EventSubscription } from '../../../_common/system/event/event-topic';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppUserCard from '../../../_common/user/card/card.vue';
import { ActivityFeedService } from '../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../components/activity/feed/view';
import { onFiresideStart } from '../../components/grid/client.service';
import AppPageContainer from '../../components/page-container/AppPageContainer.vue';
import AppPostAddButton from '../../components/post/add-button/add-button.vue';
import { useAppStore } from '../../store';
import { useLibraryStore } from '../../store/library';
import { HomeFeedService, HOME_FEED_ACTIVITY, HOME_FEED_FYP } from './home-feed.service';
import AppHomeFireside from './_fireside/AppHomeFireside.vue';

class DashGame {
	constructor(
		public id: number,
		public title: string,
		public ownerName: string,
		public createdOn: number
	) {}
}

export class RouteActivityFeedController {
	feed: ActivityFeedView | null = null;
}

@Options({
	name: 'RouteActivityFeed',
	components: {
		AppPageContainer,
		AppPostAddButton,
		AppUserCard,
		AppScrollAffix,
		AppNavTabList,
		AppHomeFireside,
		AppConfigLoaded,
		RouteHomeActivity: defineAsyncComponent(() =>
			asyncRouteLoader(router, import('./RouteHomeActivity.vue'))
		),
		RouteHomeFyp: defineAsyncComponent(() =>
			asyncRouteLoader(router, import('./RouteHomeFYP.vue'))
		),
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
	cache: true,
	lazy: true,
	resolver: () => Api.sendRequest('/web/dash/home'),
})
export default class RouteActivityFeed extends BaseRouteComponent {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	libraryStore = shallowSetup(() => useLibraryStore());

	get user() {
		return this.commonStore.user;
	}
	get communities() {
		return this.store.communities;
	}
	get unreadActivityCount() {
		return this.store.unreadActivityCount;
	}
	get developerCollection() {
		return this.libraryStore.developerCollection.value;
	}

	games: DashGame[] = [];
	gameFilterQuery = '';
	isShowingAllGames = false;

	isLoadingFiresides = true;
	isFiresidesBootstrapped = false;
	featuredFireside: Fireside | null = null;
	userFireside: Fireside | null = null;
	firesides: Fireside[] = [];
	eventFireside: Fireside | null = null;
	private firesideStart$?: EventSubscription;

	readonly Screen = Screen;
	readonly HomeFeedService = HomeFeedService;

	@Provide({ to: 'route-activity-feed' })
	controller = new RouteActivityFeedController();

	get hasSimpleHome() {
		return Screen.isLg && configHomeNav.value === 'simple';
	}

	get hasGamesSection() {
		return this.games.length > 0 && Screen.isLg;
	}

	get hasGameFilter() {
		return this.games.length > 7;
	}

	get filteredGames() {
		if (this.gameFilterQuery !== '') {
			return this.games.filter(i => this.checkGameFilter(i));
		} else if (this.isShowingAllGames) {
			return this.games;
		}
		return this.games.slice(0, 7);
	}

	get isShowAllGamesVisible() {
		return !this.isShowingAllGames && this.games.length > 7 && this.gameFilterQuery === '';
	}

	get defaultTab() {
		return HomeFeedService.getDefault();
	}

	get tabs() {
		if (HomeFeedService.getDefault() === HOME_FEED_FYP) {
			return [HOME_FEED_FYP, HOME_FEED_ACTIVITY];
		}

		return [HOME_FEED_ACTIVITY, HOME_FEED_FYP];
	}

	get feedTab() {
		return HomeFeedService.getRouteFeedTab(this.$route);
	}

	get hasUnreadActivity() {
		return this.unreadActivityCount > 0;
	}

	private checkGameFilter(game: DashGame) {
		let text = '';
		const search = this.gameFilterQuery.toLowerCase();

		text = game.title.toLowerCase();
		if (fuzzysearch(search, text)) {
			return true;
		}

		if (game.ownerName) {
			text = game.ownerName.toLowerCase();
			if (fuzzysearch(search, text)) {
				return true;
			}
		}

		return false;
	}

	routeResolved(payload: any, _fromCache: boolean) {
		if (Screen.isLg) {
			trackExperimentEngagement(configHomeNav);
		}

		this.games = (payload.ownerGames as DashGame[])
			.map(i => new DashGame(i.id, i.title, i.ownerName, i.createdOn))
			.sort((a, b) => numberSort(a.createdOn, b.createdOn))
			.reverse();

		this.refreshFiresides();
		this.firesideStart$ = onFiresideStart.subscribe(() => this.refreshFiresides());

		if (payload.eventFireside) {
			this.eventFireside = new Fireside(payload.eventFireside);
		}
	}

	routeDestroyed() {
		this.firesideStart$?.close();
	}

	onPostAdded(post: FiresidePost) {
		if (this.controller.feed) {
			ActivityFeedService.onPostAdded(this.controller.feed, post, this);
		}
	}

	async refreshFiresides() {
		if (!this.user) {
			return;
		}

		this.isLoadingFiresides = true;
		try {
			const payload = await Api.sendRequest(`/web/fireside/user-list`, undefined, {
				detach: true,
			});
			this.userFireside = payload.userFireside ? new Fireside(payload.userFireside) : null;
			this.firesides = payload.firesides ? Fireside.populate(payload.firesides) : [];
			this.featuredFireside = payload.featuredFireside
				? new Fireside(payload.featuredFireside)
				: null;
		} catch (error) {
			console.error('Failed to refresh fireside data.', error);
		}
		this.isLoadingFiresides = false;
		this.isFiresidesBootstrapped = true;
	}
}
</script>

<template>
	<section class="section fill-backdrop">
		<AppPageContainer xl>
			<template #left>
				<template v-if="hasSimpleHome">
					<AppScrollAffix>
						<nav class="-menu">
							<ol>
								<li v-for="tab of tabs" :key="tab">
									<router-link
										v-if="tab === 'fyp'"
										:to="{
											name: 'home',
											params: { tab: HomeFeedService.fypTab },
										}"
										:class="{
											active: feedTab === 'fyp',
										}"
									>
										<AppJolticon class="-menu-icon" icon="home" />
										<AppTranslate>For You</AppTranslate>
									</router-link>
									<router-link
										v-if="tab === 'activity'"
										:to="{
											name: 'home',
											params: { tab: HomeFeedService.activityTab },
										}"
										:class="{
											active: feedTab === 'activity',
										}"
									>
										<AppJolticon class="-menu-icon" icon="friends" />
										<AppTranslate>Following</AppTranslate>
										<span
											v-if="hasUnreadActivity"
											class="-unread-tag anim-fade-enter anim-fade-leave"
										/>
									</router-link>
								</li>
								<template v-if="hasGamesSection && developerCollection">
									<li>
										<router-link
											:to="developerCollection.routeLocation"
											active-class="active"
										>
											<AppJolticon class="-menu-icon" icon="gamepad" />
											<AppTranslate>Your Games</AppTranslate>
										</router-link>
									</li>
								</template>
							</ol>
						</nav>
					</AppScrollAffix>
				</template>
				<template v-else>
					<AppUserCard v-if="Screen.isDesktop" :user="user" />

					<template v-if="hasGamesSection">
						<div class="clearfix">
							<div class="pull-right">
								<AppButton
									v-app-tooltip="$gettext(`Add Game`)"
									icon="add"
									circle
									trans
									:to="{ name: 'dash.games.add' }"
								/>
							</div>
							<h4 class="section-header">
								<AppTranslate>Manage Games</AppTranslate>
							</h4>
						</div>

						<template v-if="hasGameFilter">
							<div>
								<input
									v-model="gameFilterQuery"
									type="search"
									class="form-control"
									:placeholder="$gettext(`Filter games`)"
								/>
							</div>
							<br />
						</template>

						<nav class="-game-list platform-list">
							<ul>
								<li v-for="game of filteredGames" :key="game.id">
									<router-link
										v-app-track-event="`activity:quick-game`"
										:to="{
											name: 'dash.games.manage.game.overview',
											params: { id: game.id },
										}"
										:title="
											(game.ownerName ? `@${game.ownerName}/` : '') +
											game.title
										"
									>
										<template v-if="game.ownerName">
											<small>@{{ game.ownerName }}</small>
											/
										</template>
										{{ game.title }}
									</router-link>
								</li>
							</ul>
						</nav>

						<p v-if="isShowAllGamesVisible">
							<a
								v-app-track-event="`activity:quick-game-all`"
								class="link-muted"
								@click="isShowingAllGames = !isShowingAllGames"
							>
								<AppTranslate>Show all</AppTranslate>
							</a>
						</p>
					</template>
				</template>
			</template>

			<template v-if="!Screen.isMobile" #right>
				<AppHomeFireside
					:featured-fireside="featuredFireside"
					:user-fireside="userFireside"
					:firesides="firesides"
					:is-loading="isLoadingFiresides"
					:show-placeholders="!isFiresidesBootstrapped"
					@request-refresh="refreshFiresides()"
				/>
			</template>

			<AppPostAddButton @add="onPostAdded" />

			<AppHomeFireside
				v-if="Screen.isMobile"
				:user-fireside="userFireside"
				:firesides="firesides"
				:is-loading="isLoadingFiresides"
				:show-placeholders="!isFiresidesBootstrapped"
				@request-refresh="refreshFiresides()"
			/>

			<div v-if="!hasSimpleHome" class="full-bleed-xs">
				<AppNavTabList center class="-inline-menu">
					<ul>
						<li v-for="tab of tabs" :key="tab">
							<router-link
								v-if="tab === 'activity'"
								:to="{
									name: 'home',
									params: { tab: HomeFeedService.activityTab },
								}"
								:class="{
									active: feedTab === 'activity',
								}"
							>
								<AppTranslate>Following</AppTranslate>
								<span
									v-if="hasUnreadActivity"
									class="-unread-tag anim-fade-enter anim-fade-leave"
								/>
							</router-link>
							<router-link
								v-if="tab === 'fyp'"
								:to="{
									name: 'home',
									params: { tab: HomeFeedService.fypTab },
								}"
								:class="{
									active: feedTab === 'fyp',
								}"
							>
								<AppTranslate>For You</AppTranslate>
							</router-link>
						</li>
					</ul>
				</AppNavTabList>
			</div>

			<route-home-activity v-if="feedTab === 'activity'" />
			<route-home-fyp v-else-if="feedTab === 'fyp'" />
		</AppPageContainer>
	</section>
</template>

<style lang="stylus" scoped>
.-concert
	margin-bottom: $line-height-computed

	@media $media-xs
		full-bleed-xs()

	@media $media-sm-up
		rounded-corners-lg()

.-menu
	margin-bottom: $line-height-computed
	margin-left: -8px
	margin-right: -8px
	max-width: 280px
	margin-left: auto

	ol
	li
		margin: 0
		padding: 0
		list-style: none

	a
		rounded-corners()
		padding-left: 8px
		padding-right: 8px
		display: flex
		flex-direction: row
		align-items: center
		height: 48px
		font-size: 18px
		font-weight: bold
		color: var(--theme-fg)

		&.active
			color: var(--theme-link)

		&:hover
			background-color: var(--theme-bg)

	&-icon
		font-size: 27px
		margin-right: 16px

	.-unread-tag
		margin-left: 12px

.-inline-menu
	.-unread-tag
		display: inline-block
		margin-left: 4px

.-unread-tag
	background-color: var(--theme-link)
	border-radius: 50%
	width: 12px
	height: 12px
	display: block

.-game-list
	a
		text-overflow()

// Keep things tight since it's on mobile.
.-feed-heading
	margin-top: 0
	margin-bottom: 5px
</style>
