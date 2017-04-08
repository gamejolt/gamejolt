// angular.module( 'App.Views' ).config( function( $stateProvider )
// {
// 	$stateProvider.state( 'library.collection', {
// 		abstract: true,
// 		controller: 'Library.CollectionCtrl',
// 		controllerAs: 'collectionCtrl',
// 		templateUrl: require( './collection.html' ),
// 		resolve: {

// 			// We need translations loaded in for the filtering container, so we wait for "init".
// 			filteringContainer: function( init, Game_Filtering_Container )
// 			{
// 				var filteringContainer = new Game_Filtering_Container();

// 				// For library we don't want to pull the saved filters from the main site.
// 				// This allows them to filter while on the page, but it won't store to their session.
// 				// This is generally what they'd be expecting. It's silly to filter games by default
// 				// from playlists.
// 				filteringContainer.isPersistent = false;
// 				filteringContainer.shouldDetect = false;

// 				return filteringContainer;
// 			}
// 		}
// 	} );
// } );
