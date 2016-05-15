angular.module( 'App.Forms' ).directive( 'gjFormSettings', function( $injector, Form, Environment, Settings )
{
	var form = new Form( {
		template: '/app/components/forms/settings/settings.html'
	} );

	if ( Environment.isClient ) {
		var Client_Installer = $injector.get( 'Client_Installer' );
		var Client_Autostart = $injector.get( 'Client_Autostart' );
	}

	form.onInit = function( scope )
	{
		scope.Environment = Environment;

		var formModel = scope.formModel;

		formModel.chat_notify_friends_online = Settings.get( 'chat-notify-friends-online' );
		formModel.restricted_browsing = Settings.get( 'restricted-browsing' );

		if ( Environment.isClient ) {
			scope.Client_Autostart = Client_Autostart;

			formModel.game_install_dir = Settings.get( 'game-install-dir' );
			formModel.queue_when_playing = Settings.get( 'queue-when-playing' );

			formModel.max_download_count = Settings.get( 'max-download-count' );
			formModel.limit_downloads = (formModel.max_download_count != -1);

			formModel.max_extract_count = Settings.get( 'max-extract-count' );
			formModel.limit_extractions = (formModel.max_extract_count != -1);

			if ( Client_Autostart.canAutostart() ) {
				formModel.autostart_client = Settings.get( 'autostart-client' );
			}

			// Just opens a file location dialog.
			scope.changeLocation = function( attr )
			{
				var elem = document.getElementById( 'settingsForm-' + attr );
				elem.click();
			};

			scope.$watch( 'formModel.limit_downloads', function( shouldLimit, prev )
			{
				if ( shouldLimit === prev ) {
					return;
				}
				formModel.max_download_count = shouldLimit ? Settings.getDefault( 'max-download-count' ) : -1;
			} );

			scope.$watch( 'formModel.limit_extractions', function( shouldLimit, prev )
			{
				if ( shouldLimit === prev ) {
					return;
				}
				formModel.max_extract_count = shouldLimit ? Settings.getDefault( 'max-extract-count' ) : -1;
			} );
		}

		// Saves the settings immediately back to local storage.
		scope.$watchCollection( 'formModel', function()
		{
			Settings.set( 'chat-notify-friends-online', formModel.chat_notify_friends_online );
			Settings.set( 'restricted-browsing', formModel.restricted_browsing );

			if ( Environment.isClient ) {
				Settings.set( 'game-install-dir', formModel.game_install_dir );
				Settings.set( 'max-download-count', formModel.max_download_count );
				Settings.set( 'max-extract-count', formModel.max_extract_count );
				Settings.set( 'queue-when-playing', formModel.queue_when_playing );

				if ( Client_Autostart.canAutostart() ) {
					Settings.set( 'autostart-client', formModel.autostart_client );

					if ( formModel.autostart_client ) {
						Client_Autostart.set();
					}
					else {
						Client_Autostart.clear();
					}
				}

				// Tell's it to use the new settings.
				Client_Installer.checkQueueSettings();
			}
		} );
	};

	return form;
} );
