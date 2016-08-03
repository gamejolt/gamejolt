angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameSettings', function( Form )
{
	var form = new Form( {
		model: 'Game',
		saveMethod: '$saveSettings',
		template: '/app/components/forms/dashboard/game/settings/settings.html'
	} );

	form.scope.isWizard = '<';

	form.onInit = function( scope )
	{
		scope.onLoaded = function( payload )
		{
			scope.hasPackagesForSale = payload.hasPackagesForSale;
		};
	};

	return form;
} );
