import { App } from './../../../app-service';
import { Injectable, Inject } from 'ng-metadata/core';
import { Comment_Video } from './../../../../lib/gj-lib-client/components/comment/video/video-model';

@Injectable()
export class OverviewCtrl
{
	developerGames: any[];
	videos: Comment_Video[];

	constructor(
		@Inject( '$scope' ) $scope: any,
		@Inject( 'App' ) app: App,
		@Inject( 'Meta' ) meta: any,
		@Inject( 'Game' ) game: any,
		@Inject( 'Comment_Video' ) commentVideo: typeof Comment_Video,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = $scope.profileCtrl.user.display_name + ' - ';

		if ( $scope.profileCtrl.user.is_gamer ) {
			app.title += 'An indie gamer';
		}
		else if ( $scope.profileCtrl.user.is_developer ) {
			app.title += 'An indie game developer';
		}

		meta.description = payload.metaDescription;
		meta.fb = payload.fb || {};
		meta.fb.title = app.title;
		meta.twitter = payload.twitter || {};
		meta.twitter.title = app.title;

		this.developerGames = game.populate( payload.developerGamesTeaser );
		this.videos = commentVideo.populate( payload.videos );
	}
}
