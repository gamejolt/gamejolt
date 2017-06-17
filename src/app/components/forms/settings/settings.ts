import { Component, Watch } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Settings } from '../../settings/settings.service';
import { AppFormControlToggleSwitch } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle-switch/toggle-switch';
import { ClientAutoStart as _ClientAutoStart } from '../../client/autostart/autostart.service';
import { ClientInstaller as _ClientInstaller } from '../../client/installer/installer.service';

let ClientInstaller: typeof _ClientInstaller | undefined;
let ClientAutoStart: typeof _ClientAutoStart | undefined;
if (GJ_IS_CLIENT) {
	ClientInstaller = require('../../client/installer/installer.service')
		.ClientInstaller;
	ClientAutoStart = require('../../client/autostart/autostart.service')
		.ClientAutoStart;
}

@View
@Component({
	components: {
		AppFormControlToggle,
	},
})
export class FormSettings extends BaseForm<any> implements FormOnInit {
	ClientAutoStart = ClientAutoStart;

	onInit() {
		this.formModel.chat_notify_friends_online = Settings.get(
			'chat-notify-friends-online'
		);
		this.formModel.restricted_browsing = Settings.get('restricted-browsing');
		this.formModel.broadcast_modal = Settings.get('broadcast-modal');

		if (GJ_IS_CLIENT) {
			this.formModel.game_install_dir = Settings.get('game-install-dir');
			this.formModel.queue_when_playing = Settings.get('queue-when-playing');

			this.formModel.max_download_count = Settings.get('max-download-count');
			this.formModel.limit_downloads = this.formModel.max_download_count !== -1;

			this.formModel.max_extract_count = Settings.get('max-extract-count');
			this.formModel.limit_extractions =
				this.formModel.max_extract_count !== -1;

			if (ClientAutoStart!.canAutoStart) {
				this.formModel.autostart_client = Settings.get('autostart-client');
			}
		}
	}

	/**
	 * Just opens a file location dialog.
	 */
	changeLocation(ref: string) {
		const elem = this.$refs[ref];
		if (elem) {
			(elem as HTMLElement).click();
		}
	}

	@Watch('formModel.limit_downloads')
	limitDownloadsChange(shouldLimit: boolean, prev: boolean) {
		if (shouldLimit === prev) {
			return;
		}

		this.formModel.max_download_count = shouldLimit
			? Settings.getDefault('max-download-count')
			: -1;
	}

	@Watch('formModel.limit_extractions')
	limitExtractionsChange(shouldLimit: boolean, prev: boolean) {
		if (shouldLimit === prev) {
			return;
		}

		this.formModel.max_extract_count = shouldLimit
			? Settings.getDefault('max-extract-count')
			: -1;
	}

	onChange() {
		Settings.set(
			'chat-notify-friends-online',
			this.formModel.chat_notify_friends_online
		);
		Settings.set('restricted-browsing', this.formModel.restricted_browsing);
		Settings.set('broadcast-modal', this.formModel.broadcast_modal);

		if (GJ_IS_CLIENT) {
			Settings.set('game-install-dir', this.formModel.game_install_dir);
			Settings.set('max-download-count', this.formModel.max_download_count);
			Settings.set('max-extract-count', this.formModel.max_extract_count);
			Settings.set('queue-when-playing', this.formModel.queue_when_playing);

			if (ClientAutoStart!.canAutoStart) {
				Settings.set('autostart-client', this.formModel.autostart_client);

				if (this.formModel.autostart_client) {
					ClientAutoStart!.set();
				} else {
					ClientAutoStart!.clear();
				}
			}

			// Tell's it to use the new settings.
			ClientInstaller!.checkQueueSettings();
		}
	}
}
