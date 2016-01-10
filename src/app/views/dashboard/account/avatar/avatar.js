angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.account.avatar', {
		url: '/profile/avatar',
		controller: 'Dashboard.Account.AvatarCtrl',
		controllerAs: 'avatarCtrl',
		templateUrl: '/app/views/dashboard/account/avatar/avatar.html'
	} );
} );