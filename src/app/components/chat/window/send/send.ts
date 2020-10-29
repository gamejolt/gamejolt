import Vue from 'vue';
import { Component, InjectReactive, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { ContentDocument } from '../../../../../_common/content/content-document';
import { AppContentEditorLazy } from '../../../../../_common/content/content-editor/content-editor-lazy';
import { Screen } from '../../../../../_common/screen/screen-service';
import {
	ChatClient,
	ChatKey,
	editMessage,
	queueChatMessage,
	setMessageEditing,
} from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowSendForm from './form/form.vue';

@Component({
	components: {
		AppContentEditor: AppContentEditorLazy,
		AppChatWindowSendForm,
	},
})
export default class AppChatWindowSend extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	singleLineMode = true;

	readonly Screen = Screen;

	get isSingleLineMode() {
		// We always want to be in multiline mode for phones:
		// It's expected behavior to create a new line with the "Enter" key on the virtual keyboard,
		// and send the message with a "send message" button.
		if (Screen.isMobile) {
			return false;
		}

		return this.singleLineMode;
	}

	editMessage(message: ChatMessage) {
		setMessageEditing(this.chat, null);

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
		this.chat.messageEditing ? this.editMessage(message) : this.sendMessage(message);

		this.singleLineMode = true;
	}

	onFormCancel() {
		setMessageEditing(this.chat, null);
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}

	@Watch('room.id')
	async onRoomChanged() {
		setMessageEditing(this.chat, null);
	}
}
