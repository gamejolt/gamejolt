angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.AddCtrl', function( $state, Translate, Growls, Game )
{
	Translate.pageTitle( 'dash.games.add.page_title' );

	this.onSubmit = function( formModel )
	{
		Translate.growl( 'success', 'dash.games.add.add', { _sticky: true } );

		$state.go( 'dashboard.developer.games.manage.game.overview', { id: formModel.id } );
	};
} );
