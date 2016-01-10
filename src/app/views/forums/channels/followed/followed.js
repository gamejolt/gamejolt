angular.module( 'App.Views' ).config( function( $stateProvider )
{   
    $stateProvider.state( 'forums.channels.followed', {
        url: '/forums/channels',
        controller: 'Forums.Channels.FollowedCtrl',
        controllerAs: 'followedCtrl',
        templateUrl: '/app/views/forums/channels/followed/followed.html',
    } );
} );