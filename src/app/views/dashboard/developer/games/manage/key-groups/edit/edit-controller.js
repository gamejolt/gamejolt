angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.KeyGroups.EditCtrl', function(
	$scope, $state, $stateParams, App, Api, KeyGroup, Game_Package, Key, Clipboard, ModalConfirm, Growls, Environment, gettextCatalog, payload )
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

	App.title = gettextCatalog.getString( 'Edit Key Group: {{ name }}', { name: this.keyGroup.name } );

	this.searchKeys = function()
	{
		Api.sendRequest( '/web/dash/developer/games/key-groups/search-keys/' + $stateParams.id + '/' + $stateParams.keyGroupId, this.search )
			.then( function( response )
			{
				_this.keys = Key.populate( response.keys );
			} );
	};

	this.copyKeyLink = function( key )
	{
		Clipboard.copy( Environment.secureBaseUrl + '/claim/' + key.key );
	};

	this.onNewKeysAdded = function()
	{
		// Only reload this single state.
		$state.reload( 'dashboard.developer.games.manage.key-groups.edit' );
	};

	this.removeGroup = function( keyGroup, disableKeys )
	{
		ModalConfirm.show(
			gettextCatalog.getString( "Are you sure you want to remove this key group? All keys within this key group will be invalidated. Any access that users may have gained from these keys will be revoked. This can not be reversed." ),
			gettextCatalog.getString( 'Remove key group?' )
		)
			.then( function()
			{
				return keyGroup.$remove()
					.catch( function()
					{
						Growls.error( gettextCatalog.getString( 'Could not remove key group for some reason.' ) );
					} );
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'The key group has been removed.' ),
					gettextCatalog.getString( 'Removed Key Group' )
				);
				$state.go( 'dashboard.developer.games.manage.key-groups.list' );
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
				return key.$remove()
					.catch( function()
					{
						Growls.error( gettextCatalog.getString( 'Could not remove key for some reason.' ) );
					} );
			} )
			.then( function()
			{
				Growls.success(
					gettextCatalog.getString( 'The key has been removed.' ),
					gettextCatalog.getString( 'Removed Key' )
				);
				_.remove( _this.keys, { id: key.id } );
			} );
	};
} );
