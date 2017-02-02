angular.module( 'App.Game.CompatIcons' ).directive( 'gjGameCompatIcons', function()
{
	var compatMapping = {
		'os_windows': 'windows',
		'os_mac': 'mac',
		'os_linux': 'linux',
		'os_other': 'other-os',

		'type_html': 'html5',
		'type_flash': 'flash',
		'type_unity': 'unity',
		'type_applet': 'java',
		'type_silverlight': 'silverlight',

		'type_rom': 'rom',
	};

	var compatFields = _.keys( compatMapping );

	return {
		restrict: 'E',
		template: require( '!html-loader!./compat-icons.html' ),
		scope: {},
		bindToController: {
			game: '=gjGame',
		},
		controllerAs: 'ctrl',
		controller: function()
		{
			this.compatInfo = [];
			if ( this.game.compatibility ) {
				compatFields.forEach( function( field )
				{
					if ( this.game.compatibility[ field ] ) {
						this.compatInfo.push( compatMapping[ field ] );
					}
				}, this );
			}
		},
	};
} );
