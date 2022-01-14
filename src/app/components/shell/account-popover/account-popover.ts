import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { Client } from '../../../../_common/client/safe-exports';
import { Connection } from '../../../../_common/connection/connection-service';
import { useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { formatCurrency } from '../../../../_common/filters/currency';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { SettingThemeDark } from '../../../../_common/settings/settings.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useAppStore } from '../../../store';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';
import AppShellUserBox from '../user-box/user-box.vue';

@Options({
	components: {
		AppPopper,
		AppUserAvatarImg,
		AppShellUserBox,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellAccountPopover extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	drawer = shallowSetup(() => useDrawerStore());

	themeStore = setup(() => useThemeStore());

	get isDark() {
		return this.themeStore.isDark;
	}

	isShowing = false;
	walletAmount: number | false = false;

	readonly Screen = Screen;
	readonly Connection = Connection;
	readonly formatCurrency = formatCurrency;

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
		this.themeStore.setDark(!this.isDark);
	}

	async getWallet() {
		const response = await Api.sendRequest('/web/dash/funds/wallet', undefined, {
			detach: true,
		});
		this.walletAmount = response.amount;
	}

	logout() {
		this.store.logout();
	}

	quit() {
		Client?.quit();
	}
}
