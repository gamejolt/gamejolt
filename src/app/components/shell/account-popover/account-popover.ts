import Vue from 'vue';
import { Component, Inject } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import * as _ClientMod from '../../../../_common/client/client.service';
import { Connection } from '../../../../_common/connection/connection-service';
import { DrawerStore, DrawerStoreKey } from '../../../../_common/drawer/drawer-store';
import { currency } from '../../../../_common/filters/currency';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { SettingThemeDark } from '../../../../_common/settings/settings.service';
import { AppStore } from '../../../../_common/store/app-store';
import { ThemeMutation, ThemeState, ThemeStore } from '../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { Store } from '../../../store/index';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';
import AppShellUserBox from '../user-box/user-box.vue';

let ClientMod: typeof _ClientMod | undefined;
if (GJ_IS_CLIENT) {
	ClientMod = require('../../../../_common/client/client.service');
}

@Component({
	components: {
		AppPopper,
		AppUserAvatarImg,
		AppShellUserBox,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		currency,
	},
})
export default class AppShellAccountPopover extends Vue {
	@Inject({ from: DrawerStoreKey })
	drawer!: DrawerStore;

	@State app!: AppStore;
	@ThemeState isDark!: ThemeStore['isDark'];
	@ThemeMutation setDark!: ThemeStore['setDark'];

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
		SettingThemeDark.set(!this.isDark);
		this.setDark(!this.isDark);
	}

	async getWallet() {
		const response = await Api.sendRequest('/web/dash/funds/wallet', undefined, {
			detach: true,
		});
		this.walletAmount = response.amount;
	}

	quit() {
		if (ClientMod) {
			ClientMod.Client.quit();
		}
	}
}
