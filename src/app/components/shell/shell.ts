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
import { AppOfflineAlert } from '../offline/alert/alert';
import { AppGrowls } from '../../../lib/gj-lib-client/components/growls/growls';
import { AppModals } from '../../../lib/gj-lib-client/components/modal/modals';
import { AppLoadingBar } from '../../../lib/gj-lib-client/components/loading/bar/bar';
import { Store } from '../../store/index';
import { AppMinbar } from '../../../lib/gj-lib-client/components/minbar/minbar';

@View
@Component({
	components: {
		AppShellTopNav,
		AppShellNotificationCount,
		AppShellBody,
		AppShellSidebar,
		AppShellHotBottom,
		AppMinbar,
		AppOfflineAlert,
		AppGrowls,
		AppModals,
		AppLoadingBar,
		AppShellChat: () =>
			import(/* webpackChunkName: "chat" */ './chat/chat').then(m => m.AppShellChat),
		AppShellClient: GJ_IS_CLIENT ? require('./client/client').AppShellClient : undefined,
	},
})
export class AppShell extends Vue {
	@State app: Store['app'];
	@State chat: Store['chat'];
	@State isLeftPaneVisible: Store['isLeftPaneVisible'];
	@State isRightPaneVisible: Store['isRightPaneVisible'];

	@Action clearPanes: Store['clearPanes'];

	mounted() {
		// When changing routes, hide all overlays.
		this.$router.beforeEach((_to, _from, next) => {
			this.clearPanes();
			next();
		});
	}
}
