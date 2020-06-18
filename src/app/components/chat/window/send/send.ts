import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { ContentContext } from '../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../_common/content/content-document';
import AppContentEditor from '../../../../../_common/content/content-editor/content-editor.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ChatClient, ChatKey, queueChatMessage } from '../../client';

@Component({
	components: {
		AppContentEditor,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class AppChatWindowSend extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	message = '';
	multiLineMode = false;
	contentContext: ContentContext = 'chat-message';

	$refs!: {
		input: HTMLTextAreaElement;
	};

	readonly Screen = Screen;

	// Vue will trigger all events that match, which means the "enter" event
	// always fires. We use this to know if we handled the event in another
	// event handler already.
	private handledEvent = false;

	onChange(source: string) {
		this.message = source;

		// If they remove whole message, remove multi-line mode.
		if (this.multiLineMode && this.message.length === 0) {
			this.multiLineMode = false;
		}
	}

	async shiftEnter() {
		this.multiLineMode = true;
		this.eventHandled();
	}

	async ctrlEnter() {
		this.sendMessage();
		this.eventHandled();
	}

	enter(event: Event) {
		if (this.handledEvent) {
			return;
		}

		if (!this.multiLineMode) {
			this.sendMessage();
			event.preventDefault();
			return;
		}
	}

	sendClicked() {
		this.$refs.input.focus();
		this.sendMessage();
	}

	sendMessage() {
		const doc = ContentDocument.fromJson(this.message);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			const room = this.chat.room;
			if (room) {
				queueChatMessage(this.chat, contentJson, room.id);
			}
		}

		this.message = '';
		this.multiLineMode = false;
	}

	/**
	 * Marks that the event has been handled since the `enter` event always gets
	 * called. This way `enter` will know now to do anything since the event was
	 * already handled in another handler.
	 */
	private async eventHandled() {
		this.handledEvent = true;
		await this.$nextTick();
		this.handledEvent = false;
	}
}
