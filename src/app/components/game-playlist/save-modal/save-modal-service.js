angular.module( 'App.GamePlaylist.SaveModal' ).service( 'GamePlaylist_SaveModal', function( $modal )
{
	this.show = function( playlist )
	{
		playlist = playlist || null;

		var modalInstance = $modal.open( {
			templateUrl: '/app/components/game-playlist/save-modal/save-modal.html',
			controller: 'GamePlaylist_SaveModalCtrl',
			controllerAs: 'modalCtrl',
			size: 'sm',
			resolve: {
				playlist: function()
				{
					return playlist;
				}
			}
		} );

		return modalInstance.result;
	};
} );

