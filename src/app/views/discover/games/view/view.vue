<script lang="ts">
import { computed, inject, InjectionKey, provide, ref } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { Router, useRouter } from 'vue-router';
import { enforceLocation } from '../../../../../utils/router';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../../../_common/ad/ad-store';
import { Api } from '../../../../../_common/api/api.service';
import { Collaborator } from '../../../../../_common/collaborator/collaborator.model';
import { Comment } from '../../../../../_common/comment/comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../../_common/comment/comment-store';
import { getDeviceArch, getDeviceOS } from '../../../../../_common/device/device.service';
import { Environment } from '../../../../../_common/environment/environment.service';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { CustomMessage, Game } from '../../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../../_common/game/package/package-payload.model';
import { GameRating } from '../../../../../_common/game/rating/rating.model';
import { GameScoreTable } from '../../../../../_common/game/score-table/score-table.model';
import { GameScreenshot } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameSong } from '../../../../../_common/game/song/song.model';
import { GameVideo } from '../../../../../_common/game/video/video.model';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import { LinkedAccount } from '../../../../../_common/linked-account/linked-account.model';
import { PartnerReferral } from '../../../../../_common/partner-referral/partner-referral-service';
import { Registry } from '../../../../../_common/registry/registry.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { EventSubscription } from '../../../../../_common/system/event/event-topic';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import { User } from '../../../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import AppGameCoverButtons from '../../../../components/game/cover-buttons/cover-buttons.vue';
import AppGameMaturityBlock from '../../../../components/game/maturity-block/maturity-block.vue';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { onRatingWidgetChange } from '../../../../components/rating/widget/widget.vue';
import AppDiscoverGamesViewControls from './AppDiscoverGamesViewControls.vue';
import AppDiscoverGamesViewNav from './AppDiscoverGamesViewNav.vue';
import './view-content.styl';

const Key: InjectionKey<Controller> = Symbol('game-route');

type Controller = ReturnType<typeof createController>;

export function useGameRouteController() {
	return inject(Key);
}

function createController({ router }: { router: Router }) {
	const isOverviewLoaded = ref(false);

	// We will bootstrap this right away, so it should always be set for use.
	const game = ref<Game>();

	const postsCount = ref(0);
	const trophiesCount = ref(0);
	const hasScores = ref(false);
	const primaryScoreTable = ref<GameScoreTable>();
	const twitterShareMessage = ref('Check out this game!');

	const packagePayload = ref<GamePackagePayloadModel>();
	const shouldShowMultiplePackagesMessage = ref(false);

	const userPartnerKey = ref<string>();

	const partnerKey = ref('');
	const partner = ref<User>();

	const collaboratorInvite = ref<Collaborator>();

	const userRating = ref<GameRating>();

	const mediaItems = ref<(GameScreenshot | GameVideo | GameSketchfab)[]>([]);
	const songs = ref<GameSong[]>([]);

	const profileCount = ref(0);
	const downloadCount = ref(0);
	const developerGamesCount = ref(0);
	const supporters = ref<User[]>([]);
	const supporterCount = ref(0);
	const recommendedGames = ref<Game[]>([]);
	const linkedAccounts = ref<LinkedAccount[]>([]);
	const knownFollowers = ref<User[]>([]);
	const knownFollowerCount = ref(0);

	const canToggleDescription = ref(false);
	const showDetails = ref(import.meta.env.SSR);

	const overviewComments = ref<Comment[]>([]);

	const customGameMessages = ref<CustomMessage[]>([]);

	const packages = computed(() => {
		if (!packagePayload.value) {
			return [];
		}

		return packagePayload.value.packages;
	});

	const releases = computed(() => {
		if (!packagePayload.value) {
			return [];
		}

		return packagePayload.value.releases;
	});

	const installableBuilds = computed(() => {
		const os = getDeviceOS();
		const arch = getDeviceArch();
		return Game.pluckInstallableBuilds(packages.value, os, arch);
	});

	const externalPackages = computed(() => {
		if (!packagePayload.value) {
			return [];
		}

		return packagePayload.value.externalPackages;
	});

	const downloadableBuilds = computed(() => Game.pluckDownloadableBuilds(packages.value));

	const browserBuilds = computed(() => {
		let builds = Game.pluckBrowserBuilds(packages.value);

		// On Client we only want to include HTML games.
		if (GJ_IS_DESKTOP_APP) {
			builds = builds.filter(item => item.type === GameBuild.TYPE_HTML);
		}

		// Pull in ROMs to the browser builds.
		return builds.concat(Game.pluckRomBuilds(packages.value));
	});

	const hasReleasesSection = computed(() => {
		// The releases section exists if there are releases or songs.
		return (
			externalPackages.value.length > 0 || packages.value.length > 0 || songs.value.length > 0
		);
	});

	const partnerLink = computed(() => {
		if (userPartnerKey.value && game.value) {
			let urlPath = router.resolve({
				name: 'discover.games.view.overview',
				params: {
					id: game.value.id + '',
					slug: game.value.slug,
				},
				query: {
					ref: userPartnerKey.value,
				},
			}).href;

			if (GJ_IS_DESKTOP_APP) {
				// The client urls are prefixed with a hashtag (#) that needs to be removed when referring to external links
				urlPath = urlPath.slice(1);
			}

			return `${Environment.baseUrl}${urlPath}`;
		}
		return undefined;
	});

	function _updateGame(newGame?: Game) {
		// If we already have a game, just assign new data into it to keep it
		// fresh.
		if (game.value && newGame && game.value.id === newGame.id) {
			game.value.assign(newGame);
		} else {
			game.value = newGame;
		}
	}

	function bootstrapGame(gameId: number) {
		const prevId = game.value?.id;
		const newGame = Registry.find<Game>('Game', i => i.id === gameId) ?? undefined;

		_updateGame(newGame);

		if (game.value?.id !== prevId) {
			showDetails.value = false;
			isOverviewLoaded.value = false;
			recommendedGames.value = [];
			mediaItems.value = [];
			supporters.value = [];
			overviewComments.value = [];
			userRating.value = undefined;
			linkedAccounts.value = [];
		}
	}

	function processPayload(payload: any) {
		const newGame = new Game(payload.game);
		_updateGame(newGame);

		userRating.value = payload.userRating ? new GameRating(payload.userRating) : undefined;
		postsCount.value = payload.postCount || 0;
		trophiesCount.value = payload.trophiesCount || 0;
		hasScores.value = payload.hasScores || false;
		primaryScoreTable.value = payload.primaryScoreTable
			? new GameScoreTable(payload.primaryScoreTable)
			: undefined;
		twitterShareMessage.value = payload.twitterShareMessage || 'Check out this game!';

		userPartnerKey.value = payload.userPartnerKey;
		collaboratorInvite.value = payload.invite ? new Collaborator(payload.invite) : undefined;
	}

	function processOverviewPayload(payload: any) {
		isOverviewLoaded.value = true;

		mediaItems.value = [];
		if (payload.mediaItems && payload.mediaItems.length) {
			payload.mediaItems.forEach((item: any) => {
				if (item.media_type === 'image') {
					mediaItems.value.push(new GameScreenshot(item));
				} else if (item.media_type === 'video') {
					mediaItems.value.push(new GameVideo(item));
				} else if (item.media_type === 'sketchfab') {
					mediaItems.value.push(new GameSketchfab(item));
				}
			});
		}

		// If we pull from cache, don't refresh with new payload data. If it's not cache, we
		// ovewrite with our cached data. This way the data doesn't refresh when you click back.
		if (!recommendedGames.value.length) {
			recommendedGames.value = Game.populate(payload.recommendedGames);
		} else {
			payload.recommendedGames = recommendedGames.value;
		}

		songs.value = GameSong.populate(payload.songs);
		packagePayload.value = new GamePackagePayloadModel(payload);
		shouldShowMultiplePackagesMessage.value = false;

		profileCount.value = payload.profileCount || 0;
		downloadCount.value = payload.downloadCount || 0;
		developerGamesCount.value = payload.developerGamesCount || 0;

		supporters.value = User.populate(payload.supporters);
		supporterCount.value = payload.supporterCount;

		linkedAccounts.value = LinkedAccount.populate(payload.linkedAccounts);

		overviewComments.value = Comment.populate(payload.comments);

		partnerKey.value = payload.partnerReferredKey || '';
		partner.value = payload.partnerReferredBy ? new User(payload.partnerReferredBy) : undefined;

		knownFollowers.value = User.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;

		customGameMessages.value = payload.customMessages || [];
	}

	function setUserRating(rating?: GameRating) {
		userRating.value = rating;
	}

	function acceptCollaboratorInvite(invite: Collaborator) {
		game.value!.perms = invite.perms;
		collaboratorInvite.value = undefined;
	}

	function declineCollaboratorInvite() {
		collaboratorInvite.value = undefined;
	}

	function showMultiplePackagesMessage() {
		shouldShowMultiplePackagesMessage.value = true;
	}

	function setCanToggleDescription(flag: boolean) {
		canToggleDescription.value = flag;
	}

	function toggleDetails() {
		showDetails.value = !showDetails.value;
	}

	function setOverviewComments(comments: Comment[]) {
		overviewComments.value = comments;
	}

	return {
		isOverviewLoaded,
		game,
		postsCount,
		trophiesCount,
		hasScores,
		primaryScoreTable,
		twitterShareMessage,
		packagePayload,
		shouldShowMultiplePackagesMessage,
		userPartnerKey,
		partnerKey,
		partner,
		collaboratorInvite,
		userRating,
		mediaItems,
		songs,
		profileCount,
		downloadCount,
		developerGamesCount,
		supporters,
		supporterCount,
		recommendedGames,
		linkedAccounts,
		knownFollowers,
		knownFollowerCount,
		canToggleDescription,
		showDetails,
		overviewComments,
		customGameMessages,
		packages,
		releases,
		installableBuilds,
		externalPackages,
		downloadableBuilds,
		browserBuilds,
		hasReleasesSection,
		partnerLink,

		bootstrapGame,
		processPayload,
		processOverviewPayload,
		setUserRating,
		acceptCollaboratorInvite,
		declineCollaboratorInvite,
		showMultiplePackagesMessage,
		setCanToggleDescription,
		toggleDetails,
		setOverviewComments,
	};
}

const GameThemeKey = 'game';

@Options({
	name: 'RouteDiscoverGamesView',
	components: {
		AppPageHeader,
		AppUserAvatar,
		AppUserCardHover,
		AppDiscoverGamesViewNav,
		AppDiscoverGamesViewControls,
		AppGameMaturityBlock,
		AppGameCoverButtons,
		AppGamePerms,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
	lazy: true,
	cache: true,
	deps: { params: ['slug', 'id'], query: ['intent'] },
	async resolver({ route }) {
		HistoryTick.trackSource('Game', parseInt(route.params.id as string));
		PartnerReferral.trackReferrer('Game', parseInt(route.params.id as string), route);

		const intentRedirect = IntentService.checkRoute(
			route,
			{
				intent: 'follow-game',
				message: $gettext(`You're now following this game.`),
			},
			{
				intent: 'decline-game-collaboration',
				message: $gettext(`You've declined the invitation to collaborate.`),
			}
		);
		if (intentRedirect) {
			return intentRedirect;
		}

		const payload = await Api.sendRequest('/web/discover/games/' + route.params.id);

		if (payload && payload.game) {
			const redirect = enforceLocation(route, { slug: payload.game.slug });
			if (redirect) {
				return redirect;
			}
		}

		return payload;
	},
})
export default class RouteDiscoverGamesView extends BaseRouteComponent {
	routeStore = setup(() => {
		const c = createController({ router: useRouter() });
		provide(Key, c);
		return c;
	});

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	themeStore = setup(() => useThemeStore());
	ads = setup(() => useAdsController());

	commentStore: CommentStoreModel | null = null;

	readonly Screen = Screen;

	private ratingChange$?: EventSubscription;

	private roleNames: { [k: string]: string } = {
		[Collaborator.ROLE_EQUAL_COLLABORATOR]: $gettext('an equal collaborator'),
		[Collaborator.ROLE_COMMUNITY_MANAGER]: $gettext('a community manager'),
		[Collaborator.ROLE_DEVELOPER]: $gettext('a developer'),
	};

	get game() {
		return this.routeStore.game;
	}

	get partner() {
		return this.routeStore.partner;
	}

	get partnerKey() {
		return this.routeStore.partnerKey;
	}

	get packages() {
		return this.routeStore.packages;
	}

	get collaboratorInvite() {
		return this.routeStore.collaboratorInvite;
	}

	get downloadableBuilds() {
		return this.routeStore.downloadableBuilds;
	}

	get browserBuilds() {
		return this.routeStore.browserBuilds;
	}

	get profileCount() {
		return this.routeStore.profileCount;
	}

	get installableBuilds() {
		return this.routeStore.installableBuilds;
	}

	get roleName() {
		if (!this.collaboratorInvite) {
			return '';
		}

		return this.roleNames[this.collaboratorInvite.role as string] || '';
	}

	get shouldShowCoverButtons() {
		// Only show cover buttons on the overview page.
		return !!(
			(!Screen.isXs &&
				this.$route.name === 'discover.games.view.overview' &&
				this.packages.length > 0) ||
			this.game?.hasPerms()
		);
	}

	/**
	 * The cover height changes when we switch to not showing the full cover, so
	 * let's make sure we reset the autoscroll anchor so that it scrolls to the
	 * top again.
	 */
	get autoscrollAnchorKey() {
		return this.game?.id;
	}

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.routeStore.bootstrapGame(parseInt(this.$route.params.id as string));
		this.setPageTheme();
		this._setAdSettings();

		// Any game rating change will broadcast this event. We catch it so we
		// can update the page with the new rating! Yay!
		if (!this.ratingChange$) {
			this.ratingChange$ = onRatingWidgetChange.subscribe(payload => {
				const { gameId, userRating } = payload;
				if (gameId === this.game!.id) {
					this.routeStore.setUserRating(userRating || undefined);
				}
			});
		}
	}

	routeResolved(payload: any) {
		this.routeStore.processPayload(payload);

		this.setPageTheme();
		this._setAdSettings();

		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
		this.commentStore = lockCommentStore(this.commentManager, 'Game', this.game!.id);
		setCommentCount(this.commentStore, payload.commentsCount || 0);
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(GameThemeKey);
		this._releaseAdSettings();

		this.ratingChange$?.close();

		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
	}

	async acceptCollaboration() {
		await this.collaboratorInvite!.$accept();
		this.routeStore.acceptCollaboratorInvite(this.collaboratorInvite!);
	}

	async declineCollaboration() {
		await this.collaboratorInvite!.$remove();
		this.routeStore.declineCollaboratorInvite();
	}

	scrollToMultiplePackages() {
		this.routeStore.showMultiplePackagesMessage();
		Scroll.to('game-releases');
	}

	private setPageTheme() {
		const theme = this.game?.theme ?? null;
		this.themeStore.setPageTheme({
			key: GameThemeKey,
			theme,
		});
	}

	private _setAdSettings() {
		if (!this.game) {
			return;
		}

		const settings = new AdSettingsContainer();
		settings.resource = this.game;
		settings.isPageDisabled = !this.game._should_show_ads;

		setPageAdsSettings(this.ads, settings);
	}

	private _releaseAdSettings() {
		releasePageAdsSettings(this.ads);
	}
}
</script>

<template>
	<div v-if="game" class="route-discover-games-view">
		<AppGameMaturityBlock :game="game">
			<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
				<div class="container text-center">
					<p v-translate="{ username: game.developer.username }">
						<b>@%{ username }</b>
						has invited you to collaborate on this game.
					</p>
					<AppButton solid @click="acceptCollaboration()">
						<AppTranslate>Accept</AppTranslate>
					</AppButton>
					<AppButton solid @click="declineCollaboration()">
						<AppTranslate>Decline</AppTranslate>
					</AppButton>
				</div>
			</section>

			<!--
				Don't affix the nav on download pages.
				It takes a lot of space out vertically when on small browser size.
			-->
			<AppPageHeader
				:cover-media-item="game.header_media_item"
				should-affix-nav
				:autoscroll-anchor-key="autoscrollAnchorKey"
				:show-cover-buttons="shouldShowCoverButtons"
			>
				<template v-if="shouldShowCoverButtons" #cover-buttons>
					<AppGameCoverButtons
						v-if="!Screen.isXs"
						:game="game"
						:packages="packages"
						:downloadable-builds="downloadableBuilds"
						:browser-builds="browserBuilds"
						:installable-builds="installableBuilds"
						:partner-key="partnerKey"
						:partner="partner"
						@show-multiple-packages="scrollToMultiplePackages"
					/>

					<AppGamePerms :game="game">
						<!-- we need this stupid space for some reason -->
						&nbsp;

						<AppButton
							v-app-tooltip="$gettext(`Manage Game`)"
							circle
							trans
							icon="cog"
							:to="{
								name: 'dash.games.manage.game.overview',
								params: { id: game.id },
							}"
						/>

						<AppGamePerms :game="game" required="analytics">
							<AppButton
								v-app-tooltip="$gettext(`View Game Analytics`)"
								circle
								trans
								icon="chart"
								:to="{
									name: 'dash.analytics',
									params: { resource: 'Game', resourceId: game.id },
								}"
							/>
						</AppGamePerms>
					</AppGamePerms>
				</template>

				<template #spotlight>
					<AppUserCardHover :user="game.developer">
						<AppUserAvatar :user="game.developer" />
					</AppUserCardHover>
				</template>

				<template #nav>
					<AppDiscoverGamesViewNav />
				</template>

				<template #controls>
					<AppDiscoverGamesViewControls />
				</template>

				<h1 :class="{ h2: Screen.isMobile }">
					<router-link :to="{ name: 'discover.games.view.overview' }">
						{{ game.title }}
					</router-link>
				</h1>

				<div>
					<AppTranslate>by</AppTranslate>
					{{ ' ' }}
					<router-link
						:to="{
							name: 'profile.overview',
							params: { username: game.developer.username },
						}"
					>
						{{ game.developer.display_name }}
						<AppUserVerifiedTick :user="game.developer" />
						<small>@{{ game.developer.username }}</small>
					</router-link>
				</div>
			</AppPageHeader>

			<router-view />
		</AppGameMaturityBlock>
	</div>
</template>
