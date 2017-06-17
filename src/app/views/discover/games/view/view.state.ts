import { namespace, Action, Mutation, State } from 'vuex-class';
import {
	VuexStore,
	VuexModule,
	VuexAction,
	VuexMutation,
} from '../../../../../lib/gj-lib-client/utils/vuex';

import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { GameScoreTable } from '../../../../../lib/gj-lib-client/components/game/score-table/score-table.model';
import { GamePackagePayloadModel } from '../../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { GameRating } from '../../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { Registry } from '../../../../../lib/gj-lib-client/components/registry/registry.service';
import { Comment } from '../../../../../lib/gj-lib-client/components/comment/comment-model';
import { GameScreenshot } from '../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { GameSong } from '../../../../../lib/gj-lib-client/components/game/song/song.model';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { CommentVideo } from '../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { objectPick } from '../../../../../lib/gj-lib-client/utils/object';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { router } from '../../../index';

export const RouteState = namespace('route', State);
export const RouteAction = namespace('route', Action);
export const RouteMutation = namespace('route', Mutation);

type Actions = {
	bootstrap: any;
	loadCommentsCount: undefined;
	loadVideoComments: undefined;
	refreshRatingInfo: undefined;
};

type Mutations = {
	clear: undefined;
	bootstrapGame: number;
	bootstrapFeed: undefined;
	processPayload: any;
	processOverviewPayload: any;
	processRatingPayload: any;
	setCommentsCount: number;
	pushVideoComments: CommentVideo[];
	showMultiplePackagesMessage: undefined;
};

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, Actions, Mutations> {
	isOverviewLoaded = false;

	// We will bootstrap this right away, so it should always be set for use.
	game: Game = null as any;

	commentsCount = 0;
	postsCount = 0;
	trophiesCount = 0;
	hasScores = false;
	primaryScoreTable: GameScoreTable | null = null;
	twitterShareMessage = 'Check out this game!';

	packagePayload: GamePackagePayloadModel | null = null;
	shouldShowMultiplePackagesMessage = false;

	partnerLink: string | null = null;
	userPartnerKey: string | null = null;

	partnerReferredKey = '';
	partnerReferredBy: User | null = null;
	partnerNoCut = false;

	userRating: GameRating | null = null;
	ratingBreakdown: number[] = [];

	mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[] = [];
	songs: GameSong[] = [];
	feed: ActivityFeedContainer | null = null;

	profileCount = 0;
	downloadCount = 0;
	playCount = 0;
	developerGamesCount = 0;
	supporters: User[] = [];
	recommendedGames: Game[] = [];

	showFullDescription = false;
	canToggleDescription = false;

	videoComments: CommentVideo[] = [];
	videoCommentsCount = 0;
	videoCommentsPage = 0;

	scoresPayload: any = null;
	trophiesPayload: any = null;

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

	get hasReleasesSection() {
		// The releases section exists if there are releases or songs.
		return this.packages.length > 0 || this.songs.length > 0;
	}

	@VuexAction
	async bootstrap(payload: Actions['bootstrap']) {
		this.processPayload(payload);
		this.processRatingPayload(payload);

		if (this.game.comments_enabled) {
			this.loadCommentsCount();
		}
	}

	@VuexAction
	async loadCommentsCount() {
		const response = await Comment.fetch('Game', this.game.id, 1);
		this.setCommentsCount(response.count || 0);
	}

	@VuexAction
	async loadVideoComments() {
		++this.videoCommentsPage;
		const response = await Api.sendRequest(
			'/web/discover/games/videos/' +
				this.game.id +
				'?page=' +
				this.videoCommentsPage,
		);

		this.pushVideoComments(CommentVideo.populate(response.videos));
	}

	@VuexAction
	async refreshRatingInfo() {
		const response = await Api.sendRequest(
			'/web/discover/games/refresh-rating-info/' + this.game.id,
			null,
			{ detach: true },
		);

		this.processRatingPayload(response);
	}

	/**
	 * This will clear things that may not get reset by the bootstrap methods.
	 */
	@VuexMutation
	clear() {
		console.log('clear');
		this.feed = null;
		this.showFullDescription = false;
		this.canToggleDescription = false;
	}

	@VuexMutation
	bootstrapGame(gameId: Mutations['bootstrapGame']) {
		this.game = Registry.find<Game>('Game', gameId) as any;
	}

	@VuexMutation
	bootstrapFeed() {
		// Try pulling feed from cache.
		this.feed = ActivityFeedService.bootstrap();
		console.log('bootstrap feed', this.feed);
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

		this.postsCount = payload.postCount || 0;
		this.trophiesCount = payload.trophiesCount || 0;
		this.hasScores = payload.hasScores || false;
		this.primaryScoreTable = payload.primaryScoreTable
			? new GameScoreTable(payload.primaryScoreTable)
			: null;
		this.twitterShareMessage =
			payload.twitterShareMessage || 'Check out this game!';

		this.partnerLink = null;
		this.userPartnerKey = payload.userPartnerKey;
		if (this.userPartnerKey) {
			this.partnerLink =
				Environment.baseUrl +
				router.resolve({
					name: 'discover.games.view.overview',
					params: {
						id: this.game.id + '',
						slug: this.game.slug,
						ref: this.userPartnerKey,
					},
				});
		}
	}

	@VuexMutation
	processOverviewPayload(payload: Mutations['processOverviewPayload']) {
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
		if (!this.feed) {
			this.feed = ActivityFeedService.bootstrap(
				FiresidePost.populate(payload.posts),
				{
					type: 'Fireside_Post',
					url: `/web/discover/games/devlog/posts/${this.game.id}`,
					noAutoload: !this.game._is_devlog,
				},
			);
		}

		this.songs = GameSong.populate(payload.songs);
		this.recommendedGames = Game.populate(payload.recommendedGames);
		this.packagePayload = new GamePackagePayloadModel(payload);

		this.profileCount = payload.profileCount || 0;
		this.downloadCount = payload.downloadCount || 0;
		this.playCount = payload.playCount || 0;
		this.developerGamesCount = payload.developerGamesCount || 0;

		this.supporters = User.populate(payload.supporters);

		this.videoComments = CommentVideo.populate(payload.videoComments);
		this.videoCommentsCount = payload.videoCommentsCount || 0;

		this.partnerReferredKey = payload.partnerReferredKey || '';
		this.partnerReferredBy = payload.partnerReferredBy
			? new User(payload.partnerReferredBy)
			: null;
		this.partnerNoCut = payload.partnerNoCut || false;

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
	}

	@VuexMutation
	processRatingPayload(payload: Mutations['processRatingPayload']) {
		this.userRating = payload.userRating
			? new GameRating(payload.userRating)
			: null;
		this.ratingBreakdown = payload.ratingBreakdown;
		this.game.rating_count = payload.game.rating_count;
		this.game.avg_rating = payload.game.avg_rating;
	}

	@VuexMutation
	setCommentsCount(count: Mutations['setCommentsCount']) {
		this.commentsCount = count;
	}

	@VuexMutation
	pushVideoComments(videos: Mutations['pushVideoComments']) {
		this.videoComments = this.videoComments.concat(videos);
	}

	@VuexMutation
	showMultiplePackagesMessage() {
		this.shouldShowMultiplePackagesMessage = true;
	}
}
