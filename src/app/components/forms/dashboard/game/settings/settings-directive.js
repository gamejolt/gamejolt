angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameSettings', function( $translate, Form )
{
	var form = new Form( {
		model: 'Game',
		saveMethod: '$saveSettings',
		template: '/app/components/forms/dashboard/game/settings/settings.html'
	} );

	form.onInit = function( scope )
	{

	};

	return form;
} );
