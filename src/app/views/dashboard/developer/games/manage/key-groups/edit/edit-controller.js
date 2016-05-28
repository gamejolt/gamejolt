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

	// this.onKeyGroupSaved = function( model )
	// {
	// 	Growls.success(
	// 					'Saved',
	// 					'Success'
	// 				);
	// };

	this.removeGroup = function( keyGroup, disableKeys )
	{
		ModalConfirm.show(
			gettextCatalog.getString( "Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed." ),
			gettextCatalog.getString( 'Remove key group?' )
		)
			.then( function()
			{
				return keyGroup.$remove();
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'The key group has been removed.' ),
					gettextCatalog.getString( 'Removed Key Group' )
				);
				$state.go( 'dashboard.developer.games.manage.key-groups.list' );
			} )
			.catch( function()
			{
				Growls.error( 'Could not remove key group for some reason.' );
			} );
	}

	this.removeKey = function( key )
	{
		ModalConfirm.show(
			gettextCatalog.getString( "Are you sure you want to remove this key? This will revoke this key's access, or anyone that has claimed this key. This can not be reversed." ),
			gettextCatalog.getString( 'Remove key?' )
		)
			.then( function()
			{
				return key.$remove();
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'The key has been removed.' ),
					gettextCatalog.getString( 'Removed Key' )
				);
				_.remove( _this.keys, { id: key.id } );
			} )
			.catch( function()
			{
				Growls.error( 'Could not remove key for some reason.' );
			} );
	};
} );
