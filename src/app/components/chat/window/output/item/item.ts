import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { EventBus } from '../../../../../../system/event/event-bus.service';
import { propRequired } from '../../../../../../utils/vue';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import { date } from '../../../../../../_common/filters/date';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { Popper } from '../../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, removeMessage, retryFailedQueuedMessage } from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';

export interface ChatMessageEditEvent {
	message: ChatMessage;
}

@Component({
	components: {
		AppContentViewer,
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		date,
	},
})
export default class AppChatWindowOutputItem extends Vue {
	@Prop(ChatMessage) message!: ChatMessage;
	@Prop(ChatRoom) room!: ChatRoom;
	@Prop(propRequired(Boolean)) isNew!: boolean;

	@InjectReactive(ChatKey) chat!: ChatClient;

	readonly date = date;
	readonly ChatMessage = ChatMessage;
	readonly displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

	isEditing = false;
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

	get loggedOn() {
		return date(this.message.logged_on, 'medium');
	}

	get editedOn() {
		return date(this.message.edited_on!, 'medium');
	}

	startEdit() {
		this.isEditing = true;
		EventBus.emit('Chat.editMessage', <ChatMessageEditEvent>{
			message: this.message,
		});
		Popper.hideAll();
	}

	onMessageEdit() {
		this.isEditing = false;
	}

	onClickResend() {
		retryFailedQueuedMessage(this.chat, this.message);
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}

	async removeMessage() {
		this.isEditing = false;
		Popper.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this message?`),
			undefined,
			'yes'
		);

		if (!result) {
			return;
		}

		removeMessage(this.chat, this.message.id);
	}
}
