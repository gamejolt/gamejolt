angular.module( 'App.Settings' ).service( 'Settings', function( Environment )
{
	var STORAGE_PREFIX = 'settings.';

	var defaultSettings = {
		'game-install-dir': {
			type: 'string',
			val: function()
			{
				var path = require( 'path' );
				var dataPath = nw.App.dataPath;

				return path.join( dataPath, 'Games' );
			},
		},
		'max-download-count': {
			type: 'number',
			val: 5,
		},
		'max-extract-count': {
			type: 'number',
			val: 1,
		},
		'queue-when-playing': {
			type: 'boolean',
			val: 1,
		},
		'autostart-client': {
			type: 'boolean',
			val: 1,
		},
		'chat-notify-friends-online': {
			type: 'boolean',
			val: function()
			{
				// By default we don't notify friends state in site.
				// We do notify by default in client.
				if ( Environment.isClient ) {
					return 1;
				}
				else {
					return 0;
				}
			},
		},
		'restricted-browsing': {
			type: 'boolean',
			val: 1,
		},
	};

	this.getDefault = function( setting )
	{
		if ( defaultSettings[ setting ].val && angular.isFunction( defaultSettings[ setting ].val ) ) {
			return defaultSettings[ setting ].val();
		}

		return defaultSettings[ setting ].val || undefined;
	};

	this.get = function( setting )
	{
		if ( angular.isDefined( defaultSettings[ setting ] ) ) {

			var val;
			if ( localStorage.getItem( STORAGE_PREFIX + setting ) !== null ) {
				val = localStorage.getItem( STORAGE_PREFIX + setting );
			}
			else {
				val = this.getDefault( setting );
			}

			if ( defaultSettings[ setting ].type == 'string' && !angular.isString( val ) ) {
				val = '' + val;
			}
			else if ( defaultSettings[ setting ].type == 'number' && !angular.isNumber( val ) ) {
				val = parseInt( val, 10 );
			}
			else if ( defaultSettings[ setting ].type == 'boolean' ) {
				if ( val === '0' ) {
					val = false;
				}
				val = !!val;
			}
			return val;
		}
		return null;
	};

	this.set = function( setting, val )
	{
		if ( angular.isDefined( defaultSettings[ setting ] ) ) {
			if ( val === true ) {
				val = '1';
			}
			else if ( val === false ) {
				val = '0';
			}
			localStorage.setItem( STORAGE_PREFIX + setting, val );
		}
		return this;
	};
} );
