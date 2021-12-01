import Component from 'vue-class-component';
import { Emit, InjectReactive, Prop, Watch } from 'vue-property-decorator';
import { isMac } from '../../../../../../utils/utils';
import { propRequired } from '../../../../../../utils/vue';
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
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppShortkey from '../../../../../../_common/shortkey/shortkey.vue';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../../chat-store';
import { setMessageEditing, startTyping, stopTyping, tryGetRoomRole } from '../../../client';
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
	},
})
export default class AppChatWindowSendForm extends BaseForm<FormModel> {
	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;
	@Prop(propRequired(Boolean)) singleLineMode!: boolean;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	readonly Screen = Screen;
	// Allow images to be up to 100px in height so that image and a chat message fit into the editor without scrolling.
	readonly displayRules = new ContentRules({ maxMediaWidth: 125, maxMediaHeight: 100 });

	isEditorFocused = false;
	// Don't show "Do you want to save" when dismissing the form.
	warnOnDiscard = false;
	typing = false;

	private nextMessageTimeout: NodeJS.Timer | null = null;
	private escapeCallback?: EscapeStackCallback;
	private typingTimeout!: NodeJS.Timer;

	$refs!: {
		form: AppForm;
		editor: AppFormControlContentTS;
	};

	@Emit('submit') emitSubmit(_content: FormModel) {}
	@Emit('cancel') emitCancel() {}
	@Emit('single-line-mode-change') emitSingleLineModeChange(_singleLine: boolean) {}
	@Emit('focus-change') emitFocusChange(_focused: boolean) {}

	get chat() {
		return this.chatStore.chat!;
	}

	get contentEditorTempResourceContextData() {
		if (this.chatStore.chat && this.room) {
			return { roomId: this.room.id };
		}
	}

	get placeholder() {
		if (this.chatStore.chat && this.room) {
			if (this.room.isPmRoom && this.room.user) {
				return this.$gettextInterpolate('Message @%{ username }', {
					username: this.room.user.username,
				});
			}
		}
		return this.$gettext('Send a message...');
	}

	get shouldShiftEditor() {
		return Screen.isXs && this.isEditorFocused;
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
		if (!this.valid || !this.hasContent || this.nextMessageTimeout !== null) {
			return true;
		}

		return !FormValidatorContentNoMediaUpload(this.formModel.content ?? '');
	}

	get isEditing() {
		return !!this.chat.messageEditing || false;
	}

	get editorModelId() {
		return this.formModel.id || null;
	}

	get typingText() {
		const usersOnline = this.chat.roomMembers[this.room.id];
		if (!usersOnline || usersOnline.collection.length === 0) {
			return [];
		}

		const typingNames = usersOnline.collection
			.filter(user => user.typing)
			.filter(user => user.id !== this.chat.currentUser?.id)
			.map(user => user.display_name);

		const displayNamePlaceholderValues = {
			user1: typingNames[0],
			user2: typingNames[1],
			user3: typingNames[2],
		};

		if (typingNames.length > 3) {
			return this.$gettext(`Several people are typing...`);
		} else if (typingNames.length === 3) {
			return this.$gettextInterpolate(
				`%{ user1 }, %{ user2 } and %{ user3 } are typing...`,
				displayNamePlaceholderValues
			);
		} else if (typingNames.length === 2) {
			return this.$gettextInterpolate(
				`%{ user1 } and %{ user2 } are typing...`,
				displayNamePlaceholderValues
			);
		} else if (typingNames.length === 1) {
			return this.$gettextInterpolate(
				`%{ user1 } is typing...`,
				displayNamePlaceholderValues
			);
		}

		return '';
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
		if (this.nextMessageTimeout !== null) {
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

		this.applyNextMessageTimeout();
	}

	private applyNextMessageTimeout() {
		if (!this.room.isFiresideRoom) {
			return;
		}

		// For fireside rooms, timeout the user from sending another message for 1.5s.
		// Do not do this for the owner/mods.
		if (this.chat.currentUser?.id === this.room.owner_id) {
			return;
		}
		if (this.chat.currentUser) {
			const userRole = tryGetRoomRole(this.chat, this.room, this.chat.currentUser);
			if (userRole === 'owner' || userRole === 'moderator') {
				return;
			}
		}

		this.nextMessageTimeout = setTimeout(() => {
			if (this.nextMessageTimeout) {
				clearTimeout(this.nextMessageTimeout);
				this.nextMessageTimeout = null;
			}
		}, 1500);
	}

	onChange(_value: string) {
		if (!this.typing) {
			this.typing = true;
			startTyping(this.chat, this.room);
		} else {
			clearTimeout(this.typingTimeout);
		}
		this.typingTimeout = setTimeout(this.disableTypingTimeout, TYPING_TIMEOUT_INTERVAL);
	}

	onEditorInsertBlockNode(_nodeType: string) {
		this.emitSingleLineModeChange(false);
	}

	onFocusEditor() {
		this.isEditorFocused = true;
		this.emitFocusChange(true);
	}

	onBlurEditor() {
		this.isEditorFocused = false;
		this.emitFocusChange(false);
	}

	onTabKeyPressed() {
		if (!this.isEditorFocused) {
			this.$refs.editor.focus();
		}
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
		stopTyping(this.chat, this.room);
	}
}
