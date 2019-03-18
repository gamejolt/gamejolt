import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import AppChatWindow from '../window/window.vue';
import { ChatClient } from '../client';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppChatWindow,
	},
})
export default class AppChatWindows extends Vue {
	@State chat!: ChatClient;
	@State isRightPaneVisible!: Store['isRightPaneVisible'];
}
