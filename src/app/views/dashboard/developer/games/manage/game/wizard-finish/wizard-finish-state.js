angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.wizard-finish', {
		url: '/wizard-finish',
		controller: 'Dashboard.Developer.Games.Manage.Game.WizardFinishCtrl',
		controllerAs: 'finishCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/wizard-finish/wizard-finish.html',
	} );
} );
