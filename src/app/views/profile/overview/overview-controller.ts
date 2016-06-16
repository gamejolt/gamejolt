import { App } from './../../../app-service';
import { Comment_Video } from './../../../../lib/gj-lib-client/components/comment/video/video-model';

export class OverviewCtrl
{
	developerGames: any[];
	videoComments: any[];

	static $inject = [ '$scope', 'App', 'Meta', 'Game', 'Comment_Video', 'payload' ];

	constructor(
		$scope,
		app: App,
		meta: any,
		game: any,
		commentVideo: typeof Comment_Video,
		payload: any
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
		this.videoComments = commentVideo.populate( payload.videoComments );
	}
}
