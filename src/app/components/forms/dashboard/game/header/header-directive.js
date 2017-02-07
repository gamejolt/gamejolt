var Loader = require( '../../../../../../lib/gj-lib-client/components/loader/loader.service' ).Loader;

angular.module( 'App.Forms.Dashboard' ).directive( 'gjFormDashboardGameHeader', function( Form, Api, $timeout )
{
	var form = new Form( {
		model: 'Game',
		template: require( './header.html' ),
		saveMethod: '$saveHeader',
		resetOnSubmit: true,
	} );

	form.onInit = function( scope )
	{
		scope.Loader = Loader;
		Loader.load( 'upload' );

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
