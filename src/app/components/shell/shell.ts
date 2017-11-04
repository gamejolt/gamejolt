import Vue, { Component as VComponent, AsyncComponent } from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import * as View from '!view!./shell.html';
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

const components: { [key: string]: VComponent | AsyncComponent } = {
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
};

if (GJ_IS_CLIENT) {
	components.AppClient = () => import('./client/client').then(m => m.AppClient);
	components.AppClientStatusBar = () =>
		import('../client/status-bar/status-bar').then(m => m.AppClientStatusBar);
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

	@Action clearPanes: Store['clearPanes'];

	mounted() {
		// When changing routes, hide all overlays.
		this.$router.beforeEach((_to, _from, next) => {
			this.clearPanes();
			next();
		});
	}
}
