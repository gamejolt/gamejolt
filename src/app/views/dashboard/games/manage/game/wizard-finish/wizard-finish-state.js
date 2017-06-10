angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.game.wizard-finish', {
		url: '/wizard-finish',
		controller: 'Dashboard.Developer.Games.Manage.Game.WizardFinishCtrl',
		controllerAs: 'finishCtrl',
		templateUrl: require( './wizard-finish.html' ),
	} );
} );
