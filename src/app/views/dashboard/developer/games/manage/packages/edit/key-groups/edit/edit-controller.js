angular.module( 'App.Views' ).controller( 'Dashboard.Developer.Games.Manage.Packages.Edit.KeyGroups.EditCtrl', function(
	$scope, $sce, $state, Environment, Sellable, Sellable_KeyGroup, Key, ModalConfirm, Growls, gettextCatalog, keyGroupPayload )
{
	var _this = this;

	this.sellable = keyGroupPayload.sellable ? new Sellable( keyGroupPayload.sellable ) : null;
	this.keyGroup = keyGroupPayload.keyGroup ? new Sellable_KeyGroup( keyGroupPayload.keyGroup ) : null;
	this.keys = keyGroupPayload.keys ? Key.populate( keyGroupPayload.keys ) : [];

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
				$state.go( 'dashboard.developer.games.manage.packages.edit.keygroups.list' );
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
