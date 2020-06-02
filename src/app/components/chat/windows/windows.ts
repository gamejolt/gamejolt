import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { ChatClient, ChatKey } from '../client';
import AppChatWindow from '../window/window.vue';

@Component({
	components: {
		AppChatWindow,
	},
})
export default class AppChatWindows extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@State isRightPaneVisible!: Store['isRightPaneVisible'];
}
