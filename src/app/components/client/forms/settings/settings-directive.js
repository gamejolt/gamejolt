angular.module( 'App.Client.Forms' ).directive( 'gjClientFormSettings', function( Form, Client_Settings, Client_Installer, Client_Autostart )
{
	var form = new Form( {
		template: '/app/components/client/forms/settings/settings.html'
	} );

	form.onInit = function( scope )
	{
		var formModel = scope.formModel;

		scope.Client_Autostart = Client_Autostart;

		formModel.game_install_dir = Client_Settings.get( 'game-install-dir' );
		formModel.queue_when_playing = Client_Settings.get( 'queue-when-playing' );

		formModel.max_download_count = Client_Settings.get( 'max-download-count' );
		formModel.limit_downloads = (formModel.max_download_count != -1);

		formModel.max_extract_count = Client_Settings.get( 'max-extract-count' );
		formModel.limit_extractions = (formModel.max_extract_count != -1);

		formModel.chat_notify_friends_online = Client_Settings.get( 'chat-notify-friends-online' );

		if ( Client_Autostart.canAutostart() ) {
			formModel.autostart_client = Client_Settings.get( 'autostart-client' );
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
			formModel.max_download_count = shouldLimit ? Client_Settings.getDefault( 'max-download-count' ) : -1;
		} );

		scope.$watch( 'formModel.limit_extractions', function( shouldLimit, prev )
		{
			if ( shouldLimit === prev ) {
				return;
			}
			formModel.max_extract_count = shouldLimit ? Client_Settings.getDefault( 'max-extract-count' ) : -1;
		} );

		// Saves the settings immediately back to local storage.
		scope.$watchCollection( 'formModel', function()
		{
			Client_Settings.set( 'game-install-dir', formModel.game_install_dir );
			Client_Settings.set( 'max-download-count', formModel.max_download_count );
			Client_Settings.set( 'max-extract-count', formModel.max_extract_count );
			Client_Settings.set( 'queue-when-playing', formModel.queue_when_playing );
			Client_Settings.set( 'chat-notify-friends-online', formModel.chat_notify_friends_online );

			if ( Client_Autostart.canAutostart() ) {
				Client_Settings.set( 'autostart-client', formModel.autostart_client );

				if ( formModel.autostart_client ) {
					Client_Autostart.set();
				}
				else {
					Client_Autostart.clear();
				}
			}

			// Tell's it to use the new settings.
			Client_Installer.checkQueueSettings();
		} );
	};

	return form;
} );
