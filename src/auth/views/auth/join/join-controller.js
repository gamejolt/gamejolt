angular.module( 'App.Views' ).controller( 'Auth.JoinCtrl', function( $state, App, User_LinkedAccounts, gettextCatalog )
{
	var _this = this;

	App.title = gettextCatalog.getString( 'auth.join.page_title' );
} );
