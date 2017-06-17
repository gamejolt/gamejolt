import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./windows.html?style=./windows.styl';

import { AppChatWindow } from '../window/window';
import { ChatClient } from '../client';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppChatWindow,
	},
})
export class AppChatWindows extends Vue {
	@State chat: ChatClient;
	@State isRightPaneVisible: Store['isRightPaneVisible'];
}
