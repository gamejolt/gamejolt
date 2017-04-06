import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
import * as View from '!view!./shell.html';
import './shell.styl';

import { AppShellTopNav } from './top-nav/top-nav';
import { AppShellNotificationCount } from './notification-count/notification-count';
import { AppShellBody } from './body/body';
import { AppShellSidebar } from './sidebar/sidebar';
import { AppShellHotBottom } from './hot-bottom/hot-bottom';
import { AppMinbar } from '../minbar/minbar';
import { AppOfflineAlert } from '../offline/alert/alert';
import { AppGrowls } from '../../../lib/gj-lib-client/components/growls/growls';
import { Chat } from '../chat/chat.service';
import { AppModals } from '../../../lib/gj-lib-client/components/modal/modals';
import { AppLoadingBar } from '../../../lib/gj-lib-client/components/loading/bar/bar';
import { EventBus } from '../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Mutations } from '../../store/index';

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
		AppShellChat: () => $import( './chat/chat' ).then( m => m.AppShellChat ),
	}
})
export class AppShell extends Vue
{
	@State chat: Chat | undefined;

	@Getter isLeftPaneVisible: boolean;
	@Getter isRightPaneVisible: boolean;

	@Mutation( Mutations.clearPanes )
	clearPanes: Function;

	mounted()
	{
		// When changing routes, hide all overlays.
		EventBus.on( 'routeChangeBefore', () => this.clearPanes() );
	}
}
