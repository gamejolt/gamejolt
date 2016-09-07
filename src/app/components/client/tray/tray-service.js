angular.module( 'App.Client.Tray' )
.run( function( Client_Tray, Device )
{
	var section = 'main';
	if ( /^\/auth\.html/.test( window.location.pathname ) ) {
		section = 'auth';
	}

	// TRAY IS WINDOWS ONLY AT THIS TIME
	// We should turn this on for Linux when this bug is fixed:
	// https://github.com/nwjs/nw.js/issues/2771
	if ( Device.os() == 'windows' ) {
		Client_Tray.init( section );
	}
} )
.service( 'Client_Tray', function( $injector, $state, Screen, Client, App, Environment )
{
	var gui = require( 'nw.gui' );

	this.init = function( section )
	{
		// This will happen if switching between sections.
		// Gotta destroy and recreate tray with new settings.
		if ( global.clientTray ) {
			global.clientTray.remove();
			global.clientTry = null;
		}

		// Whether or not the app will actually quit when you tell it to or if it will do a soft quit.
		var isClientGreedy = true;
		if ( section == 'auth' ) {
			isClientGreedy = false;
		}

		var win = gui.Window.get();
		var isMinimized = false;
		var isClosed = false;
		var isFocused = false;

		win.on( 'blur', function(){ isFocused = false } );
		win.on( 'focus', function(){ isFocused = true } );
		win.on( 'minimize', function(){ isMinimized = true } );
		win.on( 'restore', function(){ isMinimized = false } );

		win.on( 'close', function()
		{
			// If we should just minimize to tray instead of quitting.
			if ( isClientGreedy ) {
				isClosed = true;
				isMinimized = false;
				win.hide();
			}
			// Otherwise actually quit.
			else {
				Client.quit();
			}
		} );

		function toggleVisibility()
		{
			if ( isClosed || isMinimized || !isFocused ) {
				Client.show();
				isClosed = false;
			}
			// If the window is being shown and is focused, let's minimize it.
			else {
				win.minimize();
			}
		}

		var packagePrefix = Environment.buildType == 'production' ? '/package' : '';
		var tray = new gui.Tray( {
			title: 'Game Jolt Client',

			// We split this up so that it doesn't get injected.
			// It needs to stay as a relative file path or it will break.
			icon: packagePrefix + '/app/components/client/tray/' + (Screen.isHiDpi ? 'icon-2x.png' : 'icon.png'),
			click: toggleVisibility,
		} );

		tray.tooltip = 'Game Jolt Client';

		var menu = new gui.Menu();

		if ( section != 'auth' ) {
			menu.append( new gui.MenuItem( {
				label: 'Browse Games',
				click: function()
				{
					$state.go( 'discover.games.list.section', { section: 'featured' }, { inherit: false } );
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( { type: 'separator' } ) );

			menu.append( new gui.MenuItem( {
				label: 'Game Library',
				click: function()
				{
					$state.go( 'library.installed' );
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Dashboard',
				click: function()
				{
					$state.go( 'dashboard.main.overview' );
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Edit Account',
				click: function()
				{
					$state.go( 'dashboard.account.edit' );
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Your Profile',
				click: function()
				{
					$state.go( 'profile.overview', { username: App.user.username } );
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Your Game Token',
				click: function()
				{
					$injector.get( 'User_TokenModal' ).show();
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( {
				label: 'Settings',
				click: function()
				{
					$state.go( 'settings' );
					Client.show();
				}
			} ) );

			menu.append( new gui.MenuItem( { type: 'separator' } ) );

			menu.append( new gui.MenuItem( {
				label: 'Logout',
				click: function()
				{
					App.logout();
					Client.show();
				},
			} ) );
		}

		menu.append( new gui.MenuItem( {
			label: 'Quit',
			click: function()
			{
				Client.quit();
			},
		} ) );

		tray.menu = menu;

		// Save a global reference to this tray so it doesn't get GCed.
		global.clientTray = tray;
	};
} );
