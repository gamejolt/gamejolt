import View from '!view!./settings.html';
import { Component, Watch } from 'vue-property-decorator';

import { Settings } from '../../../../_common/settings/settings.service';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import {
	BaseForm,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import * as _ClientAutoStartMod from '../../../../_common/client/autostart/autostart.service';

let ClientAutoStartMod: typeof _ClientAutoStartMod | undefined;
if (GJ_IS_CLIENT) {
	ClientAutoStartMod = require('../../../../_common/client/autostart/autostart.service');
}

type FormModel = {
	chat_notify_friends_online: boolean;
	restricted_browsing: boolean;
	broadcast_modal: boolean;
	animated_thumbnails: boolean;
	feed_notifications: boolean;
	game_install_dir: string;
	queue_when_playing: boolean;
	max_download_count: number;
	limit_downloads: boolean;
	max_extract_count: number;
	limit_extractions: boolean;
	autostart_client: boolean;
};

@View
@Component({
	components: {
		AppFormControlToggle,
	},
})
export class FormSettings extends BaseForm<FormModel> implements FormOnInit {
	warnOnDiscard = false;

	get canClientAutostart() {
		return ClientAutoStartMod && ClientAutoStartMod.ClientAutoStart.canAutoStart;
	}

	get browserNotificationsDisabled() {
		return (Notification as any).permission === 'denied';
	}

	onInit() {
		this.setField('restricted_browsing', Settings.get('restricted-browsing'));
		this.setField('broadcast_modal', Settings.get('broadcast-modal'));
		this.setField('animated_thumbnails', Settings.get('animated-thumbnails'));
		this.setField('feed_notifications', Settings.get('feed-notifications'));

		if (GJ_IS_CLIENT) {
			this.setField('game_install_dir', Settings.get('game-install-dir'));
			this.setField('queue_when_playing', Settings.get('queue-when-playing'));

			this.setField('max_download_count', Settings.get('max-download-count'));
			this.setField('limit_downloads', this.formModel.max_download_count !== -1);

			this.setField('max_extract_count', Settings.get('max-extract-count'));
			this.setField('limit_extractions', this.formModel.max_extract_count !== -1);

			if (this.canClientAutostart) {
				this.setField('autostart_client', Settings.get('autostart-client'));
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

	onSelectedInstallDir(dir: string) {
		this.setField('game_install_dir', dir);
		this.onChange();
	}

	@Watch('formModel.limit_downloads')
	limitDownloadsChange(shouldLimit: boolean) {
		this.setField(
			'max_download_count',
			shouldLimit ? Settings.getDefault('max-download-count') : -1
		);
		this.onChange();
	}

	@Watch('formModel.limit_extractions')
	limitExtractionsChange(shouldLimit: boolean) {
		this.setField(
			'max_extract_count',
			shouldLimit ? Settings.getDefault('max-extract-count') : -1
		);
		this.onChange();
	}

	onChange() {
		Settings.set('restricted-browsing', this.formModel.restricted_browsing);
		Settings.set('broadcast-modal', this.formModel.broadcast_modal);
		Settings.set('animated-thumbnails', this.formModel.animated_thumbnails);
		Settings.set('feed-notifications', this.formModel.feed_notifications);

		if (GJ_IS_CLIENT) {
			Settings.set('game-install-dir', this.formModel.game_install_dir);
			Settings.set('max-download-count', this.formModel.max_download_count);
			Settings.set('max-extract-count', this.formModel.max_extract_count);
			Settings.set('queue-when-playing', this.formModel.queue_when_playing);

			if (ClientAutoStartMod && this.canClientAutostart) {
				Settings.set('autostart-client', this.formModel.autostart_client);

				if (this.formModel.autostart_client) {
					ClientAutoStartMod.ClientAutoStart.set();
				} else {
					ClientAutoStartMod.ClientAutoStart.clear();
				}
			}

			// Tell's it to use the new settings.
			this.$store.commit('clientLibrary/checkQueueSettings');
		}
	}
}
