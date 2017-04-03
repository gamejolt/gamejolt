import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Mutation, Getter } from 'vuex-class';
import * as View from '!view!./chat.html';

import { AppChatBubbles } from '../../chat/bubbles/bubbles';
import { AppChatSidebar } from '../../chat/sidebar/sidebar';
import { AppChatWindows } from '../../chat/windows/windows';
import { Mutations } from '../../../store/index';

@View
@Component({
	components: {
		AppChatBubbles,
		AppChatSidebar,
		AppChatWindows,
	}
})
export class AppShellChat extends Vue
{
	@Getter isRightPaneVisible: boolean;

	@Mutation( Mutations.toggleRightPane )
	toggleRightPane: Function;
}
