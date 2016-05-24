angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.packages.edit.keygroups', {
		abstract: true,
		url: '/key-groups',
		template: '<ui-view></ui-view>',
	} );
} );
