angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameHeader', function( Form, Api, $timeout )
{
	var form = new Form( {
		model: 'Game',
		template: '/app/components/forms/dashboard/game/header/header.html',
		saveMethod: '$saveHeader',
		resetOnSubmit: true,
	} );

	form.onInit = function( scope )
	{
		if ( !scope.isLoaded ) {
			Api.sendRequest( '/web/dash/developer/games/header/save/' + scope.baseModel.id ).then( function( payload )
			{
				scope.isLoaded = true;
				angular.extend( scope, payload );
			} );
		}

		scope.formModel.file = undefined;
	};

	return form;
} );
