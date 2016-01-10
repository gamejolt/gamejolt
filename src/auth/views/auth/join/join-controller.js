angular.module( 'App.Views' ).controller( 'Auth.JoinCtrl', function( $state, Translate, User_LinkedAccounts )
{
	var _this = this;

	Translate.pageTitle( 'auth.join.page_title' );

	this.joinMessage = '';
	Translate.randomMessage( 'auth.join.join_message_html' ).then( function( message )
	{
		_this.joinMessage = message;
	} );

	this.onJoined = function()
	{
		$state.go( 'auth.join.almost' );
	};

	/**
	 * Sign up is just login without an account.
	 * It'll direct to the correct page when it figures out if they have an account in the
	 * callback URL.
	 */
	this.linkedAccountLogin = function( provider )
	{
		User_LinkedAccounts.login( provider );
	};
} );
