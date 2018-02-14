import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import View from '!view!./shell.html';
import './shell.styl';

import { AppShellTopNav } from './top-nav/top-nav';
import { AppShellNotificationCount } from './notification-count/notification-count';
import { AppShellBody } from './body/body';
import { AppShellSidebar } from './sidebar/sidebar';
import { AppShellHotBottom } from './hot-bottom/hot-bottom';
import { AppGrowls } from '../../../lib/gj-lib-client/components/growls/growls';
import { AppModals } from '../../../lib/gj-lib-client/components/modal/modals';
import { AppLoadingBar } from '../../../lib/gj-lib-client/components/loading/bar/bar';
import { Store } from '../../store/index';
import { AppMinbar } from '../../../lib/gj-lib-client/components/minbar/minbar';
import { Connection } from '../../../lib/gj-lib-client/components/connection/connection-service';
import { BannerState, BannerStore } from '../../store/banner';

let components: any = {
	AppShellTopNav,
	AppShellNotificationCount,
	AppShellBody,
	AppShellSidebar,
	AppShellHotBottom,
	AppMinbar,
	AppGrowls,
	AppModals,
	AppLoadingBar,
	AppShellBanner: () =>
		import(/* webpackChunkName: "shell" */ './banner/banner').then(m => m.AppShellBanner),
	AppShellChat: () =>
		import(/* webpackChunkName: "chat" */ './chat/chat').then(m => m.AppShellChat),
};

if (GJ_IS_CLIENT) {
	components = {
		...components,
		...require('../../../_common/client/base/base'),
		...require('./client/client'),
		...require('../client/status-bar/status-bar'),
	};
}

@View
@Component({
	components,
})
export class AppShell extends Vue {
	@State app: Store['app'];
	@State chat: Store['chat'];
	@State isLeftPaneVisible: Store['isLeftPaneVisible'];
	@State isRightPaneVisible: Store['isRightPaneVisible'];
	@BannerState shouldShowBanner: BannerStore['shouldShowBanner'];

	@Action clearPanes: Store['clearPanes'];

	readonly Connection = Connection;

	mounted() {
		// When changing routes, hide all overlays.
		this.$router.beforeEach((_to, _from, next) => {
			this.clearPanes();
			next();
		});
	}
}
