angular.module( 'App' ).service( 'App', function( $window, Environment )
{
	var _this = this;

	this.ver = null;
	this.title = '';
	this.user = null;

	this.shouldShowCoverImage = true;

	this.redirectDashboard = function()
	{
		// This is mainly for client.
		// It tells the intro animation that it should play the intro even if it can't find a user.
		sessionStorage.setItem( 'client-intro-login-play', 'play' );
		$window.location.href = Environment.wttfBaseUrl + '/dashboard';
	};
} );
