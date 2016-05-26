angular.module( 'App.Views' ).controller( 'Marketplace.ClaimCtrl', function( Api, App, Growls, payload )
{
	App.title = 'Marketplace Invite';

	this.key = payload.key;

	this.claim = function()
	{
		var _this = this;

		// POST request.
		Api.sendRequest( '/web/dash/marketplace/claim/' + this.key.key, {} )
			.then( function( response )
			{
				_this.key = response.key;
			} )
			.catch( function()
			{
				Growls.error( 'Something went wrong.' );
			} );
	};
} );
