angular.module( 'App.Views' ).controller( 'AuthCtrl', function( $scope, MediaItem, authPayload )
{
	this.coverImgUrl = '';
	if ( authPayload.mediaItem ) {
		this.mediaItem = new MediaItem( authPayload.mediaItem );
		this.coverImgUrl = this.mediaItem.img_url;
	}
} );
