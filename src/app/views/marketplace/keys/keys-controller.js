angular.module( 'App.Views' ).controller( 'Marketplace.KeysCtrl', function( App, payload )
{
	App.title = 'Marketplace Invite';

	this.keys = payload.keys;
} );
