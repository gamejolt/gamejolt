import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./overview.html';

import { BeforeRouteEnter } from '../../../../../../lib/gj-lib-client/utils/router';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { GameSong } from '../../../../../../lib/gj-lib-client/components/game/song/song.model';
import { User } from '../../../../../../lib/gj-lib-client/components/user/user.model';
import { CommentVideo } from '../../../../../../lib/gj-lib-client/components/comment/video/video-model';
import { GamePackagePayloadModel } from '../../../../../../lib/gj-lib-client/components/game/package/package-payload.model';
// import { Device } from '../../../../../../lib/gj-lib-client/components/device/device.service';
// import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppDiscoverGamesViewOverviewGame } from './_game/game';
import { GameScreenshot } from '../../../../../../lib/gj-lib-client/components/game/screenshot/screenshot.model';
import { GameVideo } from '../../../../../../lib/gj-lib-client/components/game/video/video.model';
import { GameSketchfab } from '../../../../../../lib/gj-lib-client/components/game/sketchfab/sketchfab.model';
import { GameRating } from '../../../../../../lib/gj-lib-client/components/game/rating/rating.model';
import { PartnerReferral } from '../../../../../../lib/gj-lib-client/components/partner-referral/partner-referral-service';
import { AppDiscoverGamesViewOverviewDevlog } from './_devlog/devlog';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';

@View
@Component({
	name: 'route-discover-games-view-overview',
	components: {
		AppDiscoverGamesViewOverviewGame,
		AppDiscoverGamesViewOverviewDevlog,
	},
})
export default class RouteDiscoverGamesViewOverview extends Vue
{
	@Prop() id: string;
	@Prop() game: Game;
	@Prop() userRating: GameRating;
	@Prop() ratingBreakdown: number[];

	isLoaded = false;
	component: any = null;

	profileCount = 0;
	downloadCount = 0;
	playCount = 0;
	developerGamesCount = 0;

	mediaItems: (GameScreenshot | GameVideo | GameSketchfab)[] = [];
	songs: GameSong[] = [];
	recommendedGames: Game[] = [];
	supporters: User[] = [];
	videoComments: CommentVideo[] = [];
	videoCommentsCount = 0;
	posts: ActivityFeedContainer | null = null;

	// Will be empty.
	packagePayload = new GamePackagePayloadModel( {} );

	@BeforeRouteEnter( { lazy: true, cache: true } )
	beforeRoute( route: VueRouter.Route )
	{
		// If we have a tracked partner "ref" in the URL, we want to pass that along
		// when gathering the payload.
		let apiOverviewUrl = '/web/discover/games/overview/' + route.params.id;

		const ref = PartnerReferral.getReferrer( 'Game', parseInt( route.params.id, 10 ) );
		if ( ref ) {
			apiOverviewUrl += '?ref=' + ref;
		}

		return Api.sendRequest( apiOverviewUrl );
	}

	// @Watch( 'game', { immediate: true } )
	// onGame( game?: Game )
	// {
	// 	if ( !game ) {
	// 		return;
	// 	}
	// }

	routed()
	{
		this.isLoaded = true;

		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;

		if ( this.$payload.microdata ) {
			Meta.microdata = this.$payload.microdata;
		}

		this.profileCount = this.$payload.profileCount || 0;
		this.downloadCount = this.$payload.downloadCount || 0;
		this.playCount = this.$payload.playCount || 0;

		this.developerGamesCount = this.$payload.developerGamesCount || 0;

		this.mediaItems = [];
		if ( this.$payload.mediaItems && this.$payload.mediaItems.length ) {
			this.$payload.mediaItems.forEach( ( item: any ) =>
			{
				if ( item.media_type === 'image' ) {
					this.mediaItems.push( new GameScreenshot( item ) );
				}
				else if ( item.media_type === 'video' ) {
					this.mediaItems.push( new GameVideo( item ) );
				}
				else if ( item.media_type === 'sketchfab' ) {
					this.mediaItems.push( new GameSketchfab( item ) );
				}
			} );
		}

		// this.scoresPayload = _.pick( payload, [
		// 	'scoreTables',
		// 	'scoreTable',
		// 	'scores',
		// 	'scoresUserBestScore',
		// 	'scoresUserScorePlacement',
		// 	'scoresUserScoreExperience',
		// ] );

		// this.trophiesPayload = _.pick( payload, [
		// 	'trophies',
		// 	'trophiesAchieved',
		// 	'trophiesExperienceAchieved',
		// 	'trophiesShowInvisibleTrophyMessage',
		// ] );

		// const wasHistoricalView = History.inHistorical;
		// this.posts = ActivityFeedService.bootstrap( Fireside_Post.populate( this.$payload.posts ), { inHistorical: wasHistoricalView } );
		this.posts = ActivityFeedService.bootstrap( FiresidePost.populate( this.$payload.posts ), { inHistorical: false } );
		this.songs = GameSong.populate( this.$payload.songs );
		this.recommendedGames = Game.populate( this.$payload.recommendedGames );
		this.supporters = User.populate( this.$payload.supporters );
		this.videoComments = CommentVideo.populate( this.$payload.videoComments );
		this.videoCommentsCount = this.$payload.videoCommentsCount || 0;

		this.packagePayload = new GamePackagePayloadModel( this.$payload );

		// const os = Device.os();
		// const arch = Device.arch();

		// $scope.gameCtrl.packages = this.packages || [];
		// $scope.gameCtrl.installableBuilds = Game.pluckInstallableBuilds( this.packages || [], os, arch );
		// $scope.gameCtrl.browserBuilds = Game.pluckBrowserBuilds( this.packages || [] );

		// // On Client we only want to include HTML games.
		// if ( Environment.isClient ) {
		// 	$scope.gameCtrl.browserBuilds = _.where( $scope.gameCtrl.browserBuilds, { type: Game_Build.TYPE_HTML } );
		// }

		// // Pull in ROMs to the browser builds.
		// $scope.gameCtrl.browserBuilds = $scope.gameCtrl.browserBuilds.concat( Game.pluckRomBuilds( _this.packages || [] ) );

		// // The releases section exists if there are releases or songs.
		// this.hasReleasesSection = this.releases.length || this.songs.length;

		// // Active jams it may be in.
		// if ( payload.activeJam ) {
		// 	this.activeJam = new Jam( payload.activeJam );
		// }

		// // Partner referral system.
		// if ( payload.partnerReferredKey && payload.partnerReferredBy ) {
		// 	this.partnerReferredKey = payload.partnerReferredKey;
		// 	this.partnerReferredBy = new User( payload.partnerReferredBy );
		// 	this.partnerNoCut = payload.partnerNoCut || false;
		// }
	}
}
