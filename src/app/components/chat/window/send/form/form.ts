import Component from 'vue-class-component';
import { Emit, InjectReactive, Prop, Watch } from 'vue-property-decorator';
import { EventBus } from '../../../../../../system/event/event-bus.service';
import { isMac } from '../../../../../../utils/utils';
import { propRequired } from '../../../../../../utils/vue';
import { ContentContext } from '../../../../../../_common/content/content-context';
import { ContentDocument } from '../../../../../../_common/content/content-document';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import {
	EscapeStack,
	EscapeStackCallback,
} from '../../../../../../_common/escape-stack/escape-stack.service';
import AppFormControlContentTS from '../../../../../../_common/form-vue/control/content/content';
import AppFormControlContent from '../../../../../../_common/form-vue/control/content/content.vue';
import AppForm from '../../../../../../_common/form-vue/form';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import { FormValidatorContentNoMediaUpload } from '../../../../../../_common/form-vue/validators/content_no_media_upload';
import { AppObserveDimensions } from '../../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppShortkey from '../../../../../../_common/shortkey/shortkey.vue';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, setMessageEditing, startTyping, stopTyping } from '../../../client';
import { ChatMessage, CHAT_MESSAGE_MAX_CONTENT_LENGTH } from '../../../message';
import { ChatRoom } from '../../../room';

const TYPING_TIMEOUT_INTERVAL = 3000;

export type FormModel = {
	content: string;
	id?: number;
};

@Component({
	components: {
		AppFormControlContent,
		AppShortkey,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppChatWindowSendForm extends BaseForm<FormModel> {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(Boolean)) singleLineMode!: boolean;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	readonly Screen = Screen;
	readonly contentContext: ContentContext = 'chat-message';
	// Allow images to be up to 100px in height so that image and a chat message fit into the editor without scrolling.
	readonly displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });

	isEditorFocused = false;

	// Don't show "Do you want to save" when dismissing the form.
	warnOnDiscard = false;

	typing = false;

	private escapeCallback?: EscapeStackCallback;
	private typingTimeout!: NodeJS.Timer;

	$refs!: {
		form: AppForm;
		editor: AppFormControlContentTS;
	};

	@Emit('submit')
	emitSubmit(_content: FormModel) {}

	@Emit('cancel')
	emitCancel() {}

	@Emit('single-line-mode-change')
	emitSingleLineModeChange(_singleLine: boolean) {}

	get contentEditorTempResourceContextData() {
		if (this.chat && this.chat.room) {
			return { roomId: this.chat.room.id };
		}
	}

	get placeholder() {
		if (this.chat && this.chat.room) {
			if (this.chat.room.isPmRoom && this.chat.room.user) {
				return this.$gettextInterpolate('Message @%{ username }', {
					username: this.chat.room.user.username,
				});
			}
		}
		return this.$gettext('Send a message...');
	}

	get shouldShiftEditor() {
		return Screen.isXs && this.isEditorFocused;
	}

	get typingDisplayNames() {
		const usersOnline = this.chat.roomMembers[this.room.id];
		if (!usersOnline || usersOnline.collection.length === 0) {
			return [];
		}

		return usersOnline.collection
			.filter(user => user.typing)
			.filter(user => user.id !== this.chat.currentUser?.id)
			.map(user => user.display_name);
	}

	get hasContent() {
		if (!this.formModel.content) {
			return false;
		}

		const doc = ContentDocument.fromJson(this.formModel.content);
		return doc.hasContent;
	}

	get isMac() {
		return isMac();
	}

	get showMultiLineNotice() {
		return !this.singleLineMode && !Screen.isMobile;
	}

	get maxContentLength() {
		return [CHAT_MESSAGE_MAX_CONTENT_LENGTH];
	}

	get isSendButtonDisabled() {
		if (!this.valid || !this.hasContent) {
			return true;
		}

		return !FormValidatorContentNoMediaUpload(this.formModel.content ?? '');
	}

	get isEditing() {
		return !!this.chat.messageEditing || false;
	}

	@Watch('chat.messageEditing')
	async onMessageEditing(message: ChatMessage | null) {
		if (message) {
			this.setField('content', message.content);
			this.setField('id', message.id);

			// Wait in case the editor loses focus
			await this.$nextTick();
			// Regain focus on the editor
			this.$refs.editor.focus();

			this.escapeCallback = () => this.cancelEditing();
			EscapeStack.register(this.escapeCallback);
		} else {
			if (this.escapeCallback) {
				EscapeStack.deregister(this.escapeCallback);
				this.escapeCallback = undefined;
			}
		}
	}

	@Watch('room.id')
	async onRoomChanged() {
		if (this.formModel.content !== '') {
			// Clear out the editor when entering a new room.
			this.clearMsg();
		}

		// Then focus it.
		this.$refs.editor.focus();
	}

	async submitMessage() {
		let doc;

		try {
			doc = ContentDocument.fromJson(this.formModel.content);
		} catch {
			// Tried submitting empty doc.
			return;
		}

		if (doc.hasContent) {
			const submit: FormModel = { content: this.formModel.content };
			if (this.isEditing) {
				submit.id = this.formModel.id;
			}

			this.emitSubmit(submit);
			this.clearMsg();
		} else {
			// When the user tried to submit an empty doc and is in multi line mode, reset to single line.
			// They are probably trying to exit that mode, since submitting an empty message is nonsense.
			this.emitSingleLineModeChange(true);
		}
	}

	async onSubmit() {
		if (this.hasFormErrors) {
			return;
		}

		// Manually check for if media is uploading here.
		// We don't want to put the rule directly on the form cause showing form errors
		// for the media upload is sort of disruptive for chat messages.
		if (!FormValidatorContentNoMediaUpload(this.formModel.content)) {
			return;
		}

		await this.submitMessage();

		this.disableTypingTimeout();

		// Refocus editor after submitting message with enter.
		this.$refs.editor.focus();
	}

	onChange(_value: string) {
		if (!this.typing) {
			this.typing = true;
			startTyping(this.chat);
		} else {
			clearTimeout(this.typingTimeout);
		}
		this.typingTimeout = setTimeout(this.disableTypingTimeout, TYPING_TIMEOUT_INTERVAL);
	}

	onEditorInsertBlockNode(_nodeType: string) {
		this.emitSingleLineModeChange(false);
	}

	async onFocusEditor() {
		const wasShifted = this.shouldShiftEditor;

		this.isEditorFocused = true;

		// Wait until the editor controls are visible.
		await this.$nextTick();
		if (!wasShifted && this.shouldShiftEditor) {
			// We want to emit this event here too, to make sure we scroll down when the controls pop up on mobile.
			this.onInputResize();
		}
	}

	onBlurEditor() {
		this.isEditorFocused = false;
	}

	onTabKeyPressed() {
		if (!this.isEditorFocused) {
			this.$refs.editor.focus();
		}
	}

	onInputResize() {
		EventBus.emit('Chat.inputResize');
	}

	onUpKeyPressed(event: KeyboardEvent) {
		if (this.isEditing || this.hasContent) {
			return;
		}

		// Find the last message sent by the current user.
		const userMessages = this.chat.messages[this.room.id].filter(
			msg => msg.user.id === this.chat.currentUser?.id
		);
		const lastMessage = userMessages[userMessages.length - 1];

		if (lastMessage) {
			// Prevent the "up" key press. This is to stop it from acting as a "go to beginning of line".
			// The content editor is focused immediately after this, and we want the editor to focus the end
			// of the content. This prevents it jump to the beginning of the line.
			event.preventDefault();

			setMessageEditing(this.chat, lastMessage);
		}
	}

	getTypingText() {
		const displayNamePlaceholderValues = {
			user1: this.typingDisplayNames[0],
			user2: this.typingDisplayNames[1],
			user3: this.typingDisplayNames[2],
		};

		if (this.typingDisplayNames.length > 3) {
			return this.$gettext(`Several people are typing...`);
		} else if (this.typingDisplayNames.length === 3) {
			return this.$gettextInterpolate(
				`%{ user1 }, %{ user2 } and %{ user3 } are typing...`,
				displayNamePlaceholderValues
			);
		} else if (this.typingDisplayNames.length === 2) {
			return this.$gettextInterpolate(
				`%{ user1 } and %{ user2 } are typing...`,
				displayNamePlaceholderValues
			);
		} else if (this.typingDisplayNames.length === 1) {
			return this.$gettextInterpolate(
				`%{ user1 } is typing...`,
				displayNamePlaceholderValues
			);
		}

		return '';
	}

	async cancelEditing() {
		this.emitCancel();
		setMessageEditing(this.chat, null);
		this.clearMsg();

		// Wait in case the editor loses focus
		await this.$nextTick();
		// Regain focus on the editor
		this.$refs.editor.focus();
	}

	private async clearMsg() {
		this.setField('content', '');
		this.setField('id', undefined);

		// Wait for errors, then clear them.
		await this.$nextTick();
		this.$refs.form.clearErrors();
	}

	private disableTypingTimeout() {
		this.typing = false;
		stopTyping(this.chat);
	}
}
