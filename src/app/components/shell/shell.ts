import View from '!view!./shell.html';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Connection } from '../../../lib/gj-lib-client/components/connection/connection-service';
import { AppGrowls } from '../../../lib/gj-lib-client/components/growls/growls';
import { AppLoadingBar } from '../../../lib/gj-lib-client/components/loading/bar/bar';
import { AppMinbar } from '../../../lib/gj-lib-client/components/minbar/minbar';
import { AppModals } from '../../../lib/gj-lib-client/components/modal/modals';
import { BannerModule, BannerStore, Store } from '../../store/index';
import { AppShellBody } from './body/body';
import { AppShellHotBottom } from './hot-bottom/hot-bottom';
import './shell.styl';
import { AppShellSidebar } from './sidebar/sidebar';
import { AppShellTopNav } from './top-nav/top-nav';

let components: any = {
	AppShellTopNav,
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
	@State
	app!: Store['app'];

	@State
	chat!: Store['chat'];

	@State
	isLeftPaneVisible!: Store['isLeftPaneVisible'];

	@State
	isLeftPaneSticky!: Store['isLeftPaneSticky'];

	@State
	isRightPaneVisible!: Store['isRightPaneVisible'];

	@State
	hasMinibar!: Store['hasMinibar'];

	@State
	hasSidebar!: Store['hasSidebar'];

	@BannerModule.State
	hasBanner!: BannerStore['hasBanner'];

	@Action
	clearPanes!: Store['clearPanes'];

	readonly Connection = Connection;
	readonly Screen = Screen;

	mounted() {
		// When changing routes, hide all overlays.
		this.$router.beforeEach((_to, _from, next) => {
			this.clearPanes();
			next();
		});
	}
}
