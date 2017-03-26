import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Getter } from 'vuex-class';
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

@View
@Component({
	name: 'shell',
	components: {
		AppShellTopNav,
		AppShellNotificationCount,
		AppShellBody,
		AppShellSidebar,
		AppShellHotBottom,
		AppMinbar,
		AppOfflineAlert,
		AppGrowls,
		AppShellChat: () => $import( './chat/chat' ).then( m => m.AppShellChat ),
	}
})
export class AppShell extends Vue
{
	@State chat: Chat | undefined;

	@Getter isLeftPaneVisible: boolean;
	@Getter isRightPaneVisible: boolean;
}
