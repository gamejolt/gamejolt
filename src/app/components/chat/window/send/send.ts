import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { EventBus, EventBusDeregister } from '../../../../../system/event/event-bus.service';
import { isMac } from '../../../../../utils/utils';
import { propRequired } from '../../../../../utils/vue';
import { ContentDocument } from '../../../../../_common/content/content-document';
import AppContentEditor from '../../../../../_common/content/content-editor/content-editor.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ChatClient, ChatKey, editMessage, queueChatMessage } from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowSendForm from './form/form.vue';

@Component({
	components: {
		AppContentEditor,
		AppChatWindowSendForm,
	},
})
export default class AppChatWindowSend extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	isEditing = false;
	singleLineMode = true;

	readonly Screen = Screen;

	private editMessageDeregister?: EventBusDeregister;

	get isSingleLineMode() {
		// We always want to be in multiline mode for phones:
		// It's expected behavior to create a new line with the "Enter" key on the virtual keyboard,
		// and send the message with a "send message" button.
		if (Screen.isMobile) {
			return false;
		}

		return this.singleLineMode;
	}

	get showMultiLineNotice() {
		return !this.isSingleLineMode && !Screen.isMobile;
	}

	get isMac() {
		return isMac();
	}

	async mounted() {
		this.editMessageDeregister = EventBus.on(
			'Chat.editMessage',
			async () => (this.isEditing = true)
		);
	}

	destroyed() {
		if (this.editMessageDeregister) {
			this.editMessageDeregister();
			this.editMessageDeregister = undefined;
		}
	}

	editMessage(message: ChatMessage) {
		this.isEditing = false;

		const doc = ContentDocument.fromJson(message.content);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			message.content = contentJson;
		}

		editMessage(this.chat, message);
	}

	sendMessage(message: ChatMessage) {
		const doc = ContentDocument.fromJson(message.content);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			const room = this.chat.room;
			if (room) {
				queueChatMessage(this.chat, contentJson, room.id);
			}
		}
	}

	submit(message: ChatMessage) {
		!this.isEditing ? this.sendMessage(message) : this.editMessage(message);

		this.singleLineMode = true;
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}
}
