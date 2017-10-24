import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./settings.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Settings } from '../../settings/settings.service';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { ClientAutoStart as _ClientAutoStart } from '../../client/autostart/autostart.service';
import { ClientInstaller as _ClientInstaller } from '../../client/installer/installer.service';

let ClientInstaller: typeof _ClientInstaller | undefined;
let ClientAutoStart: typeof _ClientAutoStart | undefined;
if (GJ_IS_CLIENT) {
	ClientInstaller = require('../../client/installer/installer.service').ClientInstaller;
	ClientAutoStart = require('../../client/autostart/autostart.service').ClientAutoStart;
}

@View
@Component({
	components: {
		AppFormControlToggle,
	},
})
export class FormSettings extends BaseForm<any> implements FormOnInit {
	warnOnDiscard = false;

	ClientAutoStart = ClientAutoStart;

	onInit() {
		this.setField('restricted_browsing', Settings.get('restricted-browsing'));
		this.setField('broadcast_modal', Settings.get('broadcast-modal'));
		this.setField('animated_thumbnails', Settings.get('animated-thumbnails'));

		if (GJ_IS_CLIENT) {
			this.setField('game_install_dir', Settings.get('game-install-dir'));
			this.setField('queue_when_playing', Settings.get('queue-when-playing'));

			this.setField('max_download_count', Settings.get('max-download-count'));
			this.setField('limit_downloads', this.formModel.max_download_count !== -1);

			this.setField('max_extract_count', Settings.get('max-extract-count'));
			this.setField('limit_extractions', this.formModel.max_extract_count !== -1);

			if (ClientAutoStart!.canAutoStart) {
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

	@Watch('formModel.limit_downloads')
	limitDownloadsChange(shouldLimit: boolean, prev: boolean) {
		if (shouldLimit === prev) {
			return;
		}

		this.setField(
			'max_download_count',
			shouldLimit ? Settings.getDefault('max-download-count') : -1
		);
	}

	@Watch('formModel.limit_extractions')
	limitExtractionsChange(shouldLimit: boolean, prev: boolean) {
		if (shouldLimit === prev) {
			return;
		}

		this.setField('max_extract_count', shouldLimit ? Settings.getDefault('max-extract-count') : -1);
	}

	onChange() {
		Settings.set('restricted-browsing', this.formModel.restricted_browsing);
		Settings.set('broadcast-modal', this.formModel.broadcast_modal);
		Settings.set('animated-thumbnails', this.formModel.animated_thumbnails);

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
