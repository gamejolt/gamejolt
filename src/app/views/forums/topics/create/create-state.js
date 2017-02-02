angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums.topics.create', {
		url: '/f/:channelName/create',
		controller: 'Forums.Topics.CreateCtrl',
		controllerAs: 'createCtrl',
		templateUrl: require( './create.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/forums/topics/create/' + $stateParams.channelName );
			}
		}
	} );
} );
