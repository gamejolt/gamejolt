angular.module( 'App.Views.Dashboard' ).controller( 'Dashboard.Account.LinkedAccounts.LinkCallbackCtrl', function( $scope, $state, $stateParams, App, Growls, payload )
{
	if ( $stateParams.provider === 'twitter' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason === 'account-taken' ) {
				Growls.error( 'This Twitter account is already linked to another Game Jolt account.' );
			}
			else {
				Growls.error( 'Unable to link your Twitter account.' );
			}
		}
		else {
			Growls.success( 'Your Twitter account (@' + App.user.twitter_screenname + ') has been linked.', 'Account Linked' );
		}
	}
	else if ( $stateParams.provider === 'facebook' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason === 'account-taken' ) {
				Growls.error( 'This Facebook account is already linked to another Game Jolt account.' );
			}
			else {
				Growls.error( 'Unable to link your Facebook account.' );
			}
		}
		else {
			Growls.success( 'Your Facebook account (' + App.user.facebook_name + ') has been linked.', 'Account Linked' );
		}
	}
	else if ( $stateParams.provider === 'twitch' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason === 'account-taken' ) {
				Growls.error( 'This Twitch account is already linked to another Game Jolt account.' );
			}
			else {
				Growls.error( 'Unable to link your Twitch account.' );
			}
		}
		else {
			Growls.success( 'Your Twitch account (' + App.user.twitch_name + ') has been linked.', 'Account Linked' );
		}
	}
	else if ( $stateParams.provider === 'google' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason === 'account-taken' ) {
				Growls.error( 'This Google+ account is already linked to another Game Jolt account.' );
			}
			else {
				Growls.error( 'Unable to link your Google+ account.' );
			}
		}
		else {
			Growls.success( 'Your Google+ account (' + App.user.google_nickname + ') has been linked.', 'Account Linked' );
		}
	}
	else if ( $stateParams.provider === 'youtube-channel' ) {
		if ( !payload.success ) {
			if ( !payload.reason ) {
				Growls.error( 'Unable to link your YouTube channel.' );
			}
			else if ( payload.reason === 'channel-taken' ) {
				Growls.error( 'This YouTube channel is already linked to another Game Jolt account.' );
			}
			else if ( payload.reason === 'not-public' ) {
				Growls.error( 'This YouTube channel is not public.' );
			}
		}
		else {
			Growls.success( 'Your YouTube channel has been linked.', 'YouTube Channel Linked' );
			$scope.linkedAccountsCtrl.youtubeChannelLinked( payload.channel );
		}
	}

	$state.go( 'dash.account.linked-accounts' );
} );
