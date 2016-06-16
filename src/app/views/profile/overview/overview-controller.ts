import { App } from './../../../app-service';

export class OverviewCtrl
{
	developerGames: any[];
	videoComments: any[];

	constructor(
		$scope,
		App: App,
		Meta,
		Game,
		Comment_Video,
		payload
	)
	{
		App.title = $scope.profileCtrl.user.display_name + ' - ';

		if ( $scope.profileCtrl.user.is_gamer ) {
			App.title += 'An indie gamer';
		}
		else if ( $scope.profileCtrl.user.is_developer ) {
			App.title += 'An indie game developer';
		}

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb || {};
		Meta.fb.title = App.title;
		Meta.twitter = payload.twitter || {};
		Meta.twitter.title = App.title;

		this.developerGames = Game.populate( payload.developerGamesTeaser );
		this.videoComments = Comment_Video.populate( payload.videoComments );
	}
}
