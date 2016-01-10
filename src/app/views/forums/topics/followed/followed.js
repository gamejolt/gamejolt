angular.module( 'App.Views' ).config( function( $stateProvider )
{   
    $stateProvider.state( 'forums.topics.followed', {
        url: '/forums/topics',
        controller: 'Forums.Topics.FollowedCtrl',
        controllerAs: 'followedCtrl',
        templateUrl: '/app/views/forums/topics/followed/followed.html',
    } );
} );