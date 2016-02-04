angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Api.SettingsCtrl', function(
	$scope, App, Api, ModalConfirm, Growls, gettextCatalog, payload )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'dash.games.api.settings.page_title', { game: $scope.manageCtrl.game.title } );

	this.privateKey = payload.privateKey;
	this.shouldShowKey = false;

	this.generateNewKey = function()
	{
		ModalConfirm.show( gettextCatalog.getString( 'dash.games.api.settings.generate_confirmation' ) )
			.then( function()
			{
				// Make sure it's a POST request.
				return Api.sendRequest( '/web/dash/developer/games/api/settings/generate-new-key/' + $scope.manageCtrl.game.id, {} );
			} )
			.then( function( response )
			{
				if ( response.newKey ) {
					_this.privateKey = response.newKey;
					_this.shouldShowKey = true;
					Growls.success( {
						title: gettextCatalog.getString( 'dash.games.api.settings.generate_growl_title' ),
						message: gettextCatalog.getString( 'dash.games.api.settings.generate_growl' ),
						sticky: true,
					} );
				}
			} );
	};
} );
