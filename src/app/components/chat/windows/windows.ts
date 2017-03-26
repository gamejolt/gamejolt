import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import * as View from '!view!./windows.html?style=./windows.styl';

import { Chat } from '../chat.service';
import { AppChatWindow } from '../window/window';

@View
@Component({
	name: 'chat-windows',
	components: {
		AppChatWindow,
	},
})
export class AppChatWindows extends Vue
{
	client = Chat.client;

	@Getter isRightPaneVisible: boolean;
}
