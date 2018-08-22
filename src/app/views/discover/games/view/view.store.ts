import { Action, Mutation, namespace, State } from 'vuex-class';
import { Ads } from '../../../../../lib/gj-lib-client/components/ad/ads.service';
import { Comment } from '../../../../../lib/gj-lib-client/components/comment/comment-model';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { Device } from '../../../../../lib/gj-lib-client/components/device/device.service';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { EventItem } from '../../../../../lib/gj-lib-client/components/event-item/event-item.model';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { GameBuild } from '../../../../../lib/gj-lib-client/components/game/build/build.model';
import { GameCollaborator } from '../../../../../lib/gj-lib-client/components/game/collaborator/collaborator.model';
import {
	CustomMessage as CustomGameMessage,
	Game,
} from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackagePayloadModel } from '../../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { GameRating } from '../../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { GameScoreTable } from '../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { GameSong } from '../../../../../lib/gj-lib-client/components/game/song/song.model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { Registry } from '../../../../../lib/gj-lib-client/components/registry/registry.service';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { objectPick } from '../../../../../lib/gj-lib-client/utils/object';
import { VuexModule, VuexMutation, VuexStore } from '../../../../../lib/gj-lib-client/utils/vuex';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { router } from '../../../index';

export const RouteStoreName = 'gameRoute';
export const RouteState = namespace(RouteStoreName, State);
export const RouteAction = namespace(RouteStoreName, Action);
export const RouteMutation = namespace(RouteStoreName, Mutation);

type Actions = {};

type Mutations = {
	bootstrapGame: number;
	bootstrapFeed: undefined;
	processPayload: any;
	processOverviewPayload: { payload: any; fromCache: boolean };
	acceptCollaboratorInvite: GameCollaborator;
	declineCollaboratorInvite: GameCollaborator;
	pushVideoComments: CommentVideo[];
	showMultiplePackagesMessage: undefined;
	toggleDescription: undefined;
	setCanToggleDescription: boolean;
	setUserRating: GameRating | null;
	addPost: FiresidePost;
};

function setAds(game?: Game) {
	if (!game) {
		return;
	}

	let mat: string | undefined = undefined;
	if (game.tigrs_age === 1) {
		mat = 'everyone';
	} else if (game.tigrs_age === 2) {
		mat = 'teen';
	} else if (game.tigrs_age === 3) {
		mat = 'adult';
	}

	Ads.resource = game;
	Ads.globalTargeting = {
		mat,
		genre: game.category,
		paid: game.is_paid_game ? 'y' : 'n',
		game: game.id + '',
	};
	Ads.setAdUnit('gamepage');
}

/**
 * Check whether this post should cause a redirect to the dashboard when it's a new post being added
 * to the feed from the developer.
 */
export function gameStoreCheckPostRedirect(post: FiresidePost, game: Game) {
	if (post.status !== FiresidePost.STATUS_ACTIVE) {
		router.push({
			name: 'dash.games.manage.devlog',
			params: { id: game.id + '', tab: 'draft' },
		});
		return false;
	}
	return true;
}

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, Actions, Mutations> {
	isOverviewLoaded = false;

	// We will bootstrap this right away, so it should always be set for use.
	game: Game = null as any;

	postsCount = 0;
	trophiesCount = 0;
	hasScores = false;
	primaryScoreTable: GameScoreTable | null = null;
	twitterShareMessage = 'Check out this game!';

	packagePayload: GamePackagePayloadModel | null = null;
	shouldShowMultiplePackagesMessage = false;

	userPartnerKey: string | null = null;

	partnerKey = '';
	partner: User | null = null;

	collaboratorInvite: GameCollaborator | null = null;

	userRating: GameRating | null = null;

	mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[] = [];
	songs: GameSong[] = [];
	feed: ActivityFeedContainer | null = null;

	profileCount = 0;
	downloadCount = 0;
	playCount = 0;
	developerGamesCount = 0;
	supporters: User[] = [];
	supporterCount = 0;
	recommendedGames: Game[] = [];

	canToggleDescription = false;
	showDetails = false;

	overviewComments: Comment[] = [];

	videoComments: CommentVideo[] = [];
	videoCommentsCount = 0;
	videoCommentsPage = 0;

	scoresPayload: any = null;
	trophiesPayload: any = null;

	customGameMessages: CustomGameMessage[] = [];

	get packages() {
		if (!this.packagePayload) {
			return [];
		}

		return this.packagePayload.packages;
	}

	get releases() {
		if (!this.packagePayload) {
			return [];
		}

		return this.packagePayload.releases;
	}

	get installableBuilds() {
		const os = Device.os();
		const arch = Device.arch();
		return Game.pluckInstallableBuilds(this.packages, os, arch);
	}

	get downloadableBuilds() {
		return Game.pluckDownloadableBuilds(this.packages);
	}

	get browserBuilds() {
		let builds = Game.pluckBrowserBuilds(this.packages);

		// On Client we only want to include HTML games.
		if (GJ_IS_CLIENT) {
			builds = builds.filter(item => item.type === GameBuild.TYPE_HTML);
		}

		// Pull in ROMs to the browser builds.
		return builds.concat(Game.pluckRomBuilds(this.packages));
	}

	get hasReleasesSection() {
		// The releases section exists if there are releases or songs.
		return this.packages.length > 0 || this.songs.length > 0;
	}

	get partnerLink() {
		if (this.userPartnerKey) {
			let urlPath = router.resolve({
				name: 'discover.games.view.overview',
				params: {
					id: this.game.id + '',
					slug: this.game.slug,
				},
				query: {
					ref: this.userPartnerKey,
				},
			}).href;

			if (GJ_IS_CLIENT) {
				// The client urls are prefixed with a hashtag (#) that needs to be removed when referring to external links
				urlPath = urlPath.slice(1);
			}

			return `${Environment.baseUrl}${urlPath}`;
		}
		return undefined;
	}

	@VuexMutation
	bootstrapGame(gameId: Mutations['bootstrapGame']) {
		this.game = Registry.find<Game>('Game', gameId) as any;
		this.showDetails = false;
		this.isOverviewLoaded = false;
		this.recommendedGames = [];
		this.mediaItems = [];
		this.supporters = [];
		this.videoComments = [];
		this.overviewComments = [];
		this.userRating = null;
		setAds(this.game);
	}

	@VuexMutation
	bootstrapFeed() {
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
	}

	@VuexMutation
	processPayload(payload: Mutations['processPayload']) {
		// Load in the full data that we have for the game.
		const game = new Game(payload.game);
		if (this.game) {
			this.game.assign(game);
		} else {
			this.game = game;
		}

		this.userRating = payload.userRating ? new GameRating(payload.userRating) : null;
		this.postsCount = payload.postCount || 0;
		this.trophiesCount = payload.trophiesCount || 0;
		this.hasScores = payload.hasScores || false;
		this.primaryScoreTable = payload.primaryScoreTable
			? new GameScoreTable(payload.primaryScoreTable)
			: null;
		this.twitterShareMessage = payload.twitterShareMessage || 'Check out this game!';

		this.userPartnerKey = payload.userPartnerKey;
		this.collaboratorInvite = payload.invite ? new GameCollaborator(payload.invite) : null;

		setAds(this.game);
	}

	@VuexMutation
	processOverviewPayload(data: Mutations['processOverviewPayload']) {
		const { payload, fromCache } = data;
		this.isOverviewLoaded = true;

		this.mediaItems = [];
		if (payload.mediaItems && payload.mediaItems.length) {
			payload.mediaItems.forEach((item: any) => {
				if (item.media_type === 'image') {
					this.mediaItems.push(new GameScreenshot(item));
				} else if (item.media_type === 'video') {
					this.mediaItems.push(new GameVideo(item));
				} else if (item.media_type === 'sketchfab') {
					this.mediaItems.push(new GameSketchfab(item));
				}
			});
		}

		// This may have been bootstrapped from cache in the `bootstrapFeed`
		// mutation. If there was no cached feed, then we'll generate a new one.
		// Also regenerate if the game changed.
		if (!fromCache && !this.feed) {
			this.feed = ActivityFeedService.bootstrap(EventItem.populate(payload.posts), {
				type: 'EventItem',
				url: `/web/discover/games/devlog/posts/${this.game.id}`,
			});
		}

		// If we pull from cache, don't refresh with new payload data. If it's not cache, we
		// ovewrite with our cached data. This way the data doesn't refresh when you click back.
		if (!this.recommendedGames.length) {
			this.recommendedGames = Game.populate(payload.recommendedGames);
		} else {
			payload.recommendedGames = this.recommendedGames;
		}

		this.songs = GameSong.populate(payload.songs);
		this.packagePayload = new GamePackagePayloadModel(payload);
		this.shouldShowMultiplePackagesMessage = false;

		this.profileCount = payload.profileCount || 0;
		this.downloadCount = payload.downloadCount || 0;
		this.playCount = payload.playCount || 0;
		this.developerGamesCount = payload.developerGamesCount || 0;

		this.supporters = User.populate(payload.supporters);
		this.supporterCount = payload.supporterCount;

		this.overviewComments = Comment.populate(payload.comments);

		this.videoComments = CommentVideo.populate(payload.videoComments);
		this.videoCommentsCount = payload.videoCommentsCount || 0;

		this.partnerKey = payload.partnerReferredKey || '';
		this.partner = payload.partnerReferredBy ? new User(payload.partnerReferredBy) : null;

		this.scoresPayload = objectPick(payload, [
			'scoreTables',
			'scoreTable',
			'scores',
			'scoresUserBestScore',
			'scoresUserScorePlacement',
			'scoresUserScoreExperience',
		]);

		this.trophiesPayload = objectPick(payload, [
			'trophies',
			'trophiesAchieved',
			'trophiesExperienceAchieved',
			'trophiesShowInvisibleTrophyMessage',
		]);

		this.customGameMessages = payload.customMessages || [];
	}

	@VuexMutation
	setUserRating(rating: Mutations['setUserRating']) {
		this.userRating = rating;
	}

	@VuexMutation
	acceptCollaboratorInvite(invite: Mutations['acceptCollaboratorInvite']) {
		this.game.perms = invite.perms;
		this.collaboratorInvite = null;
	}

	@VuexMutation
	declineCollaboratorInvite() {
		this.collaboratorInvite = null;
	}

	@VuexMutation
	pushVideoComments(videos: Mutations['pushVideoComments']) {
		++this.videoCommentsPage;
		this.videoComments = this.videoComments.concat(videos);
	}

	@VuexMutation
	showMultiplePackagesMessage() {
		this.shouldShowMultiplePackagesMessage = true;
	}

	@VuexMutation
	setCanToggleDescription(flag: Mutations['setCanToggleDescription']) {
		this.canToggleDescription = flag;
	}

	@VuexMutation
	toggleDetails() {
		this.showDetails = !this.showDetails;
	}

	@VuexMutation
	addPost(post: Mutations['addPost']) {
		if (gameStoreCheckPostRedirect(post, this.game)) {
			this.feed!.prepend([post]);
		}
	}
}
