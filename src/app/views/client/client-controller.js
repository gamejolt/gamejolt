angular.module( 'App.Views' ).controller( 'ClientCtrl', function( $sce, $http, App, Device, Growls, Fireside_Post, payload )
{
	var _this = this;

	App.title = 'Game Jolt Client'

	this.platform = Device.os();
	this.firesidePosts = Fireside_Post.populate( payload.firesidePosts );

	var MANIFEST_URL = 'https://d.gamejolt.net/data/client/manifest-2.json';
	this.download = function( platform )
	{
		if ( platform == 'windows' ) {
			platform = 'win32';
		}
		else if ( platform == 'linux' ) {
			platform = 'linux64';
		}
		else if ( platform == 'mac' ) {
			platform = 'osx64';
		}

		// This will reset the iframe since it removes it when there is no download src.
		this.downloadSrc = undefined;

		$http.get( MANIFEST_URL )
			.then( function( response )
			{
				if ( !response.data[ platform ] || !response.data[ platform ].url ) {
					Growls.error( 'Could not find a download for your platform!' );
					return;
				}

				_this.downloadSrc = $sce.trustAsResourceUrl( response.data[ platform ].url );
			} );
	};
} );
