angular.module( 'App.Client.Settings' ).service( 'Client_Settings', function()
{
	var STORAGE_PREFIX = 'settings.';

	var gui = require( 'nw.gui' );
	var path = require( 'path' );
	var dataPath = gui.App.dataPath;

	var defaultSettings = {
		'game-install-dir': {
			type: 'string',
			val: path.join( dataPath, 'Games' ),
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
			val: 1,
		}
	};

	this.getDefault = function( setting )
	{
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
				val = defaultSettings[ setting ].val;
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
