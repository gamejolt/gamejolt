<script lang="ts">
import { computed, inject, InjectionKey, provide, ref } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import {
	AdSettingsContainer,
	releasePageAdsSettings,
	setPageAdsSettings,
	useAdsController,
} from '../../../../../_common/ad/ad-store';
import { trackExperimentEngagement } from '../../../../../_common/analytics/analytics.service';
import { Api } from '../../../../../_common/api/api.service';
import {
	$acceptCollaboratorInvite,
	$removeCollaboratorInvite,
	CollaboratorModel,
	CollaboratorRole,
} from '../../../../../_common/collaborator/collaborator.model';
import { CommentModel } from '../../../../../_common/comment/comment-model';
import {
	commentStoreCount,
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
} from '../../../../../_common/comment/comment-store';
import { configGuestNoAuthRequired } from '../../../../../_common/config/config.service';
import { getDeviceArch, getDeviceOS } from '../../../../../_common/device/device.service';
import { GameBuildType } from '../../../../../_common/game/build/build.model';
import {
	CustomGameMessage,
	GameModel,
	handleGameAddFailure,
	pluckBrowserGameBuilds,
	pluckDownloadableGameBuilds,
	pluckInstallableGameBuilds,
	pluckRomGameBuilds,
} from '../../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../../_common/game/package/package-payload.model';
import { onRatingWidgetChange } from '../../../../../_common/game/rating/AppGameRatingWidget.vue';
import { GameRatingModel } from '../../../../../_common/game/rating/rating.model';
import { GameScoreTableModel } from '../../../../../_common/game/score-table/score-table.model';
import { GameScreenshotModel } from '../../../../../_common/game/screenshot/screenshot.model';
import { GameSketchfabModel } from '../../../../../_common/game/sketchfab/sketchfab.model';
import { GameSongModel } from '../../../../../_common/game/song/song.model';
import { GameVideoModel } from '../../../../../_common/game/video/video.model';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import { LinkedAccountModel } from '../../../../../_common/linked-account/linked-account.model';
import { storeModelList } from '../../../../../_common/model/model-store.service';
import { Registry } from '../../../../../_common/registry/registry.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { EventSubscription } from '../../../../../_common/system/event/event-topic';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserVerifiedTick from '../../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { UserModel } from '../../../../../_common/user/user.model';
import { enforceLocation } from '../../../../../utils/router';
import AppGameCoverButtons from '../../../../components/game/cover-buttons/AppGameCoverButtons.vue';
import AppGameMaturityBlock from '../../../../components/game/maturity-block/maturity-block.vue';
import { AppGamePerms } from '../../../../components/game/perms/perms';
import { IntentService } from '../../../../components/intent/intent.service';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';
import AppPageHeaderAvatar from '../../../../components/page-header/AppPageHeaderAvatar.vue';
import AppDiscoverGamesViewControls from './AppDiscoverGamesViewControls.vue';
import AppDiscoverGamesViewNav from './AppDiscoverGamesViewNav.vue';
import './view-content.styl';

const Key: InjectionKey<Controller> = Symbol('game-route');

type Controller = ReturnType<typeof createController>;

export function useGameRouteController() {
	return inject(Key);
}

function createController() {
	const isOverviewLoaded = ref(false);

	// We will bootstrap this right away, so it should always be set for use.
	const game = ref<GameModel>();

	const postsCount = ref(0);
	const trophiesCount = ref(0);
	const hasScores = ref(false);
	const primaryScoreTable = ref<GameScoreTableModel>();
	const twitterShareMessage = ref('Check out this game!');

	const packagePayload = ref<GamePackagePayloadModel>();
	const shouldShowMultiplePackagesMessage = ref(false);

	const collaboratorInvite = ref<CollaboratorModel>();

	const userRating = ref<GameRatingModel>();

	const mediaItems = ref<(GameScreenshotModel | GameVideoModel | GameSketchfabModel)[]>([]);
	const songs = ref<GameSongModel[]>([]);

	const profileCount = ref(0);
	const downloadCount = ref(0);
	const developerGamesCount = ref(0);
	const supporters = ref<UserModel[]>([]);
	const supporterCount = ref(0);
	const recommendedGames = ref<GameModel[]>([]);
	const linkedAccounts = ref<LinkedAccountModel[]>([]);
	const knownFollowers = ref<UserModel[]>([]);
	const knownFollowerCount = ref(0);

	const canToggleDescription = ref(false);
	const showDetails = ref(import.meta.env.SSR);

	const overviewComments = ref<CommentModel[]>([]);

	const customGameMessages = ref<CustomGameMessage[]>([]);

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
		return pluckInstallableGameBuilds(packages.value, os, arch);
	});

	const externalPackages = computed(() => {
		if (!packagePayload.value) {
			return [];
		}

		return packagePayload.value.externalPackages;
	});

	const downloadableBuilds = computed(() => pluckDownloadableGameBuilds(packages.value));

	const browserBuilds = computed(() => {
		let builds = pluckBrowserGameBuilds(packages.value);

		// On Client we only want to include HTML games.
		if (GJ_IS_DESKTOP_APP) {
			builds = builds.filter(item => item.type === GameBuildType.Html);
		}

		// Pull in ROMs to the browser builds.
		return builds.concat(pluckRomGameBuilds(packages.value));
	});

	const hasReleasesSection = computed(() => {
		// The releases section exists if there are releases or songs.
		return (
			externalPackages.value.length > 0 || packages.value.length > 0 || songs.value.length > 0
		);
	});

	function _updateGame(newGame?: GameModel) {
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
		const newGame = Registry.find<GameModel>('Game', i => i.id === gameId) ?? undefined;

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
		const newGame = new GameModel(payload.game);
		_updateGame(newGame);

		userRating.value = payload.userRating ? new GameRatingModel(payload.userRating) : undefined;
		postsCount.value = payload.postCount || 0;
		trophiesCount.value = payload.trophiesCount || 0;
		hasScores.value = payload.hasScores || false;
		primaryScoreTable.value = payload.primaryScoreTable
			? new GameScoreTableModel(payload.primaryScoreTable)
			: undefined;
		twitterShareMessage.value = payload.twitterShareMessage || 'Check out this game!';

		collaboratorInvite.value = payload.invite
			? new CollaboratorModel(payload.invite)
			: undefined;
	}

	function processOverviewPayload(payload: any) {
		isOverviewLoaded.value = true;

		mediaItems.value = [];
		if (payload.mediaItems && payload.mediaItems.length) {
			payload.mediaItems.forEach((item: any) => {
				if (item.media_type === 'image') {
					mediaItems.value.push(new GameScreenshotModel(item));
				} else if (item.media_type === 'video') {
					mediaItems.value.push(new GameVideoModel(item));
				} else if (item.media_type === 'sketchfab') {
					mediaItems.value.push(new GameSketchfabModel(item));
				}
			});
		}

		// If we pull from cache, don't refresh with new payload data. If it's not cache, we
		// ovewrite with our cached data. This way the data doesn't refresh when you click back.
		if (!recommendedGames.value.length) {
			recommendedGames.value = GameModel.populate(payload.recommendedGames);
		} else {
			payload.recommendedGames = recommendedGames.value;
		}

		songs.value = GameSongModel.populate(payload.songs);
		packagePayload.value = new GamePackagePayloadModel(payload);
		shouldShowMultiplePackagesMessage.value = false;

		profileCount.value = payload.profileCount || 0;
		downloadCount.value = payload.downloadCount || 0;
		developerGamesCount.value = payload.developerGamesCount || 0;

		supporters.value = UserModel.populate(payload.supporters);
		supporterCount.value = payload.supporterCount;

		linkedAccounts.value = LinkedAccountModel.populate(payload.linkedAccounts);

		overviewComments.value = storeModelList(CommentModel, payload.comments);

		knownFollowers.value = UserModel.populate(payload.knownFollowers);
		knownFollowerCount.value = payload.knownFollowerCount || 0;

		customGameMessages.value = payload.customMessages || [];
	}

	function setUserRating(rating?: GameRatingModel) {
		userRating.value = rating;
	}

	function acceptCollaboratorInvite(invite: CollaboratorModel) {
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

	function setOverviewComments(comments: CommentModel[]) {
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
		AppPageHeaderAvatar,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	lazy: true,
	cache: true,
	deps: { params: ['slug', 'id'], query: ['intent'] },
	async resolver({ route }) {
		HistoryTick.trackSource('Game', parseInt(route.params.id as string));

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
export default class RouteDiscoverGamesView extends LegacyRouteComponent {
	routeStore = setup(() => {
		const c = createController();
		provide(Key, c);
		return c;
	});

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	themeStore = setup(() => useThemeStore());
	ads = setup(() => useAdsController());
	commonStore = setup(() => useCommonStore());

	commentStore: CommentStoreModel | null = null;

	readonly Screen = Screen;
	readonly configGuestNoAuthRequired = configGuestNoAuthRequired;

	private ratingChange$?: EventSubscription;

	private roleNames: { [k: string]: string } = {
		[CollaboratorRole.EqualCollaborator]: $gettext('an equal collaborator'),
		[CollaboratorRole.CommunityManager]: $gettext('a community manager'),
		[CollaboratorRole.Developer]: $gettext('a developer'),
	};

	get user() {
		return this.commonStore.user;
	}

	get game() {
		return this.routeStore.game;
	}

	get collaboratorInvite() {
		return this.routeStore.collaboratorInvite;
	}

	get profileCount() {
		return this.routeStore.profileCount;
	}

	get roleName() {
		if (!this.collaboratorInvite) {
			return '';
		}

		return this.roleNames[this.collaboratorInvite.role as string] || '';
	}

	get shouldShowCoverButtons() {
		// Only show cover buttons if they have permissions to edit it.
		return this.game?.hasPerms();
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
		commentStoreCount(this.commentStore, payload.commentsCount || 0);

		trackExperimentEngagement(configGuestNoAuthRequired);
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
		try {
			await $acceptCollaboratorInvite(this.collaboratorInvite!);
			this.routeStore.acceptCollaboratorInvite(this.collaboratorInvite!);
		} catch (error: any) {
			console.log('Error status for accepting game collaboration.', error);
			handleGameAddFailure(this.user!, error.reason, this.$router);
		}
	}

	async declineCollaboration() {
		await $removeCollaboratorInvite(this.collaboratorInvite!);
		this.routeStore.declineCollaboratorInvite();
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

			<AppPageHeader
				:cover-media-item="game.header_media_item"
				should-affix-nav
				:autoscroll-anchor-key="autoscrollAnchorKey"
				:show-cover-buttons="shouldShowCoverButtons"
			>
				<template v-if="shouldShowCoverButtons" #cover-buttons>
					<AppGamePerms :game="game">
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
					</AppGamePerms>

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
				</template>

				<template #spotlight>
					<AppPageHeaderAvatar :user="game.developer" />
				</template>

				<template #nav>
					<AppDiscoverGamesViewNav />
				</template>

				<template #controls>
					<AppDiscoverGamesViewControls v-if="!configGuestNoAuthRequired.value" />
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
