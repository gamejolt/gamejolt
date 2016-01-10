angular.module( 'App.Views' ).controller( 'Profile.OverviewCtrl', function( $scope, App, Meta, Game, payload )
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

	this.developerGames = payload.developerGamesTeaser ? Game.populate( payload.developerGamesTeaser ) : [];
} );
