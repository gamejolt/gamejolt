import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import * as View from '!view!./account-popover.html?style=./account-popover.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppShellUserBox } from '../user-box/user-box';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Store } from '../../../store/index';
import { UserTokenModal } from '../../user/token-modal/token-modal.service';
import { ClientControl } from '../../client/control/client.service';

@View
@Component({
	components: {
		AppPopover,
		AppJolticon,
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
	@State app: AppStore;

	walletAmount: number | false = false;

	Screen = makeObservableService(Screen);
	Connection = makeObservableService(Connection);
	ClientControl: typeof ClientControl | null = GJ_IS_CLIENT
		? require('../../client/control/client.service').ClientControl
		: null;

	@Action logout: Store['logout'];

	onShow() {
		this.$emit('shown');
		this.getWallet();
	}

	onHide() {
		this.$emit('hidden');
	}

	showToken() {
		UserTokenModal.show();
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
}
