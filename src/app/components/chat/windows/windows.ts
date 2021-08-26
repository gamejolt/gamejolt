import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { ChatStore, ChatStoreKey } from '../chat-store';
import AppChatWindow from '../window/window.vue';

@Component({
	components: {
		AppChatWindow,
	},
})
export default class AppChatWindows extends Vue {
	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;
	@State visibleLeftPane!: Store['visibleLeftPane'];

	get chat() {
		return this.chatStore.chat!;
	}

	getRoomQueuedMessages(roomId: number) {
		return this.chat.messageQueue.filter(i => i.room_id === roomId);
	}
}
