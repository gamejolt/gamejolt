angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardProfile', function( $window, Form, Api, Environment )
{
	var form = new Form( {
		model: 'User',
		template: '/app/components/forms/dashboard/profile/profile.html',

		// We need this to reset all the times.
		resetOnSubmit: true,
	} );

	form.onInit = function( scope )
	{
		scope.Environment = Environment;
		
		Api.sendRequest( '/web/dash/profile/save' ).then( function( payload )
		{
			scope.isLoaded = true;
			angular.extend( scope, payload );

			scope.formModel.assign( payload.user );

			if ( scope.usernameTimeLeft ) {
				scope.usernameDuration = $window.moment.duration( scope.usernameTimeLeft ).humanize();
			}

			if ( scope.nameTimeLeft ) {
				scope.nameDuration = $window.moment.duration( scope.nameTimeLeft ).humanize();
			}
		} );
	};

	return form;
} );
