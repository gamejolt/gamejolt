import View from '!view!./account-popover.html?style=./account-popover.styl';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { AppUserAvatarImg } from 'game-jolt-frontend-lib/components/user/user-avatar/img/img';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import {
	ThemeMutation,
	ThemeState,
	ThemeStore,
} from '../../../../lib/gj-lib-client/components/theme/theme.store';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import * as _ClientMod from '../../../../_common/client/client.service';
import { Settings } from '../../../../_common/settings/settings.service';
import { Store } from '../../../store/index';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';
import { AppShellUserBox } from '../user-box/user-box';

let ClientMod: typeof _ClientMod | undefined;
if (GJ_IS_CLIENT) {
	ClientMod = require('../../../../_common/client/client.service');
}

@View
@Component({
	components: {
		AppPopper,
		AppUserAvatarImg,
		AppShellUserBox,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		currency,
	},
})
export class AppShellAccountPopover extends Vue {
	@State
	app!: AppStore;

	@ThemeState
	isDark!: ThemeStore['isDark'];

	@ThemeMutation
	setDark!: ThemeStore['setDark'];

	isShowing = false;
	walletAmount: number | false = false;

	readonly Screen = Screen;
	readonly Connection = Connection;

	@Action
	logout!: Store['logout'];

	onShow() {
		this.isShowing = true;
		this.getWallet();
	}

	onHide() {
		this.isShowing = false;
	}

	showToken() {
		UserTokenModal.show();
	}

	toggleDark() {
		Settings.set('theme-dark', !this.isDark);
		this.setDark(!this.isDark);
	}

	async getWallet() {
		const response = await Api.sendRequest(
			'/web/dash/funds/wallet',
			{},
			{
				detach: true,
			}
		);
		this.walletAmount = response.amount;
	}

	quit() {
		if (ClientMod) {
			ClientMod.Client.quit();
		}
	}
}
