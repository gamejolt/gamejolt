import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { ThemeMutation, ThemeState, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import * as _ClientMod from '../../../../_common/client/client.service';
import { Settings } from '../../../../_common/settings/settings.service';
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
		AppTrackEvent,
		AppTooltip,
	},
	filters: {
		currency,
	},
})
export default class AppShellAccountPopover extends Vue {
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
