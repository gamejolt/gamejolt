angular.module( 'App.Views' ).controller( 'Dashboard.Account.LinkedAccounts.LinkCallbackCtrl', function( $state, $stateParams, App, Growls, payload )
{
	if ( $stateParams.provider == 'twitter' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason == 'account-taken' ) {
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
	else if ( $stateParams.provider == 'facebook' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason == 'account-taken' ) {
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
	else if ( $stateParams.provider == 'google' ) {
		if ( !payload.success ) {
			if ( payload.reason && payload.reason == 'account-taken' ) {
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

	$state.go( 'dashboard.account.linked-accounts' );
} );
