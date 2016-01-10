angular.module( 'App.GamePlaylist.SaveModal' ).controller( 'GamePlaylist_SaveModalCtrl', function( $modalInstance, playlist )
{
	var _this = this;
	this.playlist = playlist;

	this.onSaved = function( response )
	{
		$modalInstance.close( response );
	};

	this.close = function()
	{
		$modalInstance.dismiss();
	};
} );
