import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Getter, State } from 'vuex-class';
import * as View from '!view!./windows.html?style=./windows.styl';

import { AppChatWindow } from '../window/window';
import { ChatClient } from '../client';

@View
@Component({
	components: {
		AppChatWindow,
	},
})
export class AppChatWindows extends Vue
{
	@State chat: ChatClient;
	@Getter isRightPaneVisible: boolean;
}
