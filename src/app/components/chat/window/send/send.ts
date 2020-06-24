import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { isMac } from '../../../../../utils/utils';
import { propRequired } from '../../../../../utils/vue';
import { ContentDocument } from '../../../../../_common/content/content-document';
import AppContentEditor from '../../../../../_common/content/content-editor/content-editor.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ChatClient, ChatKey, queueChatMessage } from '../../client';
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

	get showMultiLineNotice() {
		return !this.isSingleLineMode && !Screen.isMobile;
	}

	get isMac() {
		return isMac();
	}

	sendMessage(message: string) {
		const doc = ContentDocument.fromJson(message);
		if (doc instanceof ContentDocument) {
			const contentJson = doc.toJson();
			const room = this.chat.room;
			if (room) {
				queueChatMessage(this.chat, contentJson, room.id);
			}
		}

		this.singleLineMode = true;
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}
}
