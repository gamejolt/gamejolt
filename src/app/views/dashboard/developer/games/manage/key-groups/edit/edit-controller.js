angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.KeyGroups.EditCtrl', function(
	$scope, $state, $stateParams, Api, KeyGroup, Game_Package, Key, ModalConfirm, Growls, gettextCatalog, payload )
{
	var _this = this;

	$scope.KeyGroup = KeyGroup;

	this.keyGroup = payload.keyGroup ? new KeyGroup( payload.keyGroup ) : null;
	this.packages = Game_Package.populate( payload.packages );
	this.keys = Key.populate( payload.keys );

	this.search = {
		filter: '',
		state: 'all',
	};

	this.searchKeys = function()
	{
		Api.sendRequest( '/web/dash/developer/games/key-groups/search-keys/' + $stateParams.id + '/' + $stateParams.keyGroupId, this.search )
			.then( function( response )
			{
				_this.keys = Key.populate( response.keys );
			} );
	};

	this.onKeyGroupSaved = function( model )
	{
		Growls.success(
						'Saved',
						'Success'
					);
	};

	this.removeGroup = function( keyGroup, disableKeys )
	{
		ModalConfirm.show( 'Remove Key Group?' )//gettextCatalog.getString( 'dash.games.remove_confirmation' ) )
			.then( function()
			{
				return keyGroup.$remove( disableKeys );
			} )
			.then( function()
			{
				Growls.success(
					'Removed', //gettextCatalog.getString( 'dash.games.removed_growl' ),
					'Removed' //gettextCatalog.getString( 'dash.games.removed_growl_title' )
				);
				$state.go( 'dashboard.developer.games.manage.keygroups.list' );
			} );
	}

	this.removeKey = function( key )
	{
		ModalConfirm.show( 'Remove Key?' )//gettextCatalog.getString( 'dash.games.remove_confirmation' ) )
			.then( function()
			{
				return key.$remove();
			} )
			.then( function()
			{
				Growls.success(
					'Removed', //gettextCatalog.getString( 'dash.games.removed_growl' ),
					'Removed' //gettextCatalog.getString( 'dash.games.removed_growl_title' )
				);
				_.remove( _this.keys, { id: key.id } );
			} );
	};
} );
