import { Component, Watch } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { BaseForm } from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { FormCommonComponents } from '../../../../lib/gj-lib-client/components/form-vue/form';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Settings } from '../../settings/settings.service';

// if ( Environment.isClient ) {
// 	var Client_Installer = $injector.get( 'Client_Installer' );
// 	var Client_Autostart = $injector.get( 'Client_Autostart' );
// }

@View
@Component({
	components: {
		...FormCommonComponents,
	},
})
export class FormSettings extends BaseForm
{
	Environment = Environment;

	created()
	{
		this.formModel.chat_notify_friends_online = Settings.get( 'chat-notify-friends-online' );
		this.formModel.restricted_browsing = Settings.get( 'restricted-browsing' );
		this.formModel.broadcast_modal = Settings.get( 'broadcast-modal' );

		if ( Environment.isClient ) {
			// scope.Client_Autostart = Client_Autostart;

			this.formModel.game_install_dir = Settings.get( 'game-install-dir' );
			this.formModel.queue_when_playing = Settings.get( 'queue-when-playing' );

			this.formModel.max_download_count = Settings.get( 'max-download-count' );
			this.formModel.limit_downloads = (this.formModel.max_download_count !== -1);

			this.formModel.max_extract_count = Settings.get( 'max-extract-count' );
			this.formModel.limit_extractions = (this.formModel.max_extract_count !== -1);

			// if ( Client_Autostart.canAutostart() ) {
			// 	this.formModel.autostart_client = Settings.get( 'autostart-client' );
			// }
		}
	}

	/**
	 * Just opens a file location dialog.
	 */
	changeLocation( ref: string )
	{
		const elem = this.$refs[ ref ];
		if ( elem ) {
			(elem as HTMLElement).click();
		}
	}

	@Watch( 'formModel.limit_downloads' )
	limitDownloadsChange( shouldLimit: boolean, prev: boolean )
	{
		if ( shouldLimit === prev ) {
			return;
		}

		this.formModel.max_download_count = shouldLimit
			? Settings.getDefault( 'max-download-count' )
			: -1;
	}

	@Watch( 'formModel.limit_extractions' )
	limitExtractionsChange( shouldLimit: boolean, prev: boolean )
	{
		if ( shouldLimit === prev ) {
			return;
		}

		this.formModel.max_extract_count = shouldLimit
			? Settings.getDefault( 'max-extract-count' )
			: -1;
	}

	@Watch( 'formModel', { deep: true } )
	formModelChange()
	{
		console.log( 'form model change' );
		Settings.set( 'chat-notify-friends-online', this.formModel.chat_notify_friends_online );
		Settings.set( 'restricted-browsing', this.formModel.restricted_browsing );
		Settings.set( 'broadcast-modal', this.formModel.broadcast_modal );

		if ( Environment.isClient ) {
			Settings.set( 'game-install-dir', this.formModel.game_install_dir );
			Settings.set( 'max-download-count', this.formModel.max_download_count );
			Settings.set( 'max-extract-count', this.formModel.max_extract_count );
			Settings.set( 'queue-when-playing', this.formModel.queue_when_playing );

			// if ( Client_Autostart.canAutostart() ) {
			// 	Settings.set( 'autostart-client', this.formModel.autostart_client );

			// 	if ( this.formModel.autostart_client ) {
			// 		Client_Autostart.set();
			// 	}
			// 	else {
			// 		Client_Autostart.clear();
			// 	}
			// }

			// // Tell's it to use the new settings.
			// Client_Installer.checkQueueSettings();
		}
	}
}
