import { Inject, Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { ChatClient, ChatKey } from '../client';
import AppChatWindow from '../window/window.vue';

@Options({
	components: {
		AppChatWindow,
	},
})
export default class AppChatWindows extends Vue {
	@Inject({ from: ChatKey })
	chat!: ChatClient;

	@State visibleLeftPane!: Store['visibleLeftPane'];

	getRoomQueuedMessages(roomId: number) {
		return this.chat.messageQueue.filter(i => i.room_id === roomId);
	}
}
