import { transparentize } from 'polished';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import { date } from '../../../../../../_common/filters/date';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { Popper } from '../../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Theme } from '../../../../../../_common/theme/theme.model';
import { ThemeState, ThemeStore } from '../../../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import {
	ChatClient,
	ChatKey,
	removeMessage,
	retryFailedQueuedMessage,
	setMessageEditing,
	userCanModerateOtherUser,
} from '../../../client';
import { ChatMessage } from '../../../message';
import { ChatRoom } from '../../../room';
import AppChatUserPopover from '../../../user-popover/user-popover.vue';

export interface ChatMessageEditEvent {
	message: ChatMessage;
}

@Component({
	components: {
		AppContentViewer,
		AppPopper,
		AppChatUserPopover,
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

	@Inject({ from: ChatKey })
	chat!: ChatClient;

	@ThemeState theme?: ThemeStore['theme'];
	@ThemeState isDark?: ThemeStore['isDark'];

	readonly date = date;
	readonly ChatMessage = ChatMessage;
	readonly displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

	singleLineMode = true;
	messageOptionsVisible = false;

	readonly Screen = Screen;

	get actualTheme() {
		// Use the form/page/user theme, or the default theme if none exist.
		return this.theme || new Theme(null);
	}

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
		return {
			template: date(this.message.logged_on, 'shortTime'),
			tooltip: date(this.message.logged_on, 'medium'),
		};
	}

	get isEditing() {
		return this.chat.messageEditing === this.message;
	}

	/** The background-color for chat items that are being edited. */
	get isEditingColor() {
		if (!this.isEditing) {
			return null;
		}

		const highlight = '#' + this.actualTheme.highlight_;
		const backlight = '#' + this.actualTheme.backlight_;

		const tintColor = this.isDark ? highlight : backlight;
		return transparentize(0.85, tintColor);
	}

	get editingState() {
		if (this.isEditing) {
			return {
				/** The text to display in the comment */
				display: '(editing...)',
				/** The tooltip to display on hover or tap */
				tooltip: '',
			};
		}

		if (this.message.edited_on) {
			return {
				display: '(edited)',
				tooltip: date(this.message.edited_on!, 'medium'),
			};
		}

		return null;
	}

	get shouldShowMessageOptions() {
		return this.canRemoveMessage || this.canEditMessage;
	}

	get canRemoveMessage() {
		if (!this.chat.currentUser) {
			return false;
		}

		// The owner of the message can remove it.
		if (this.chat.currentUser.id === this.message.user.id) {
			return true;
		}

		// Mods/Room owners can also remove the message.
		return userCanModerateOtherUser(
			this.chat,
			this.room,
			this.chat.currentUser,
			this.message.user
		);
	}

	get canEditMessage() {
		// Only content messages can be edited.
		if (this.message.type !== 'content') {
			return false;
		}
		if (!this.chat.currentUser) {
			return false;
		}

		// Only the owner of the message can edit.
		return this.chat.currentUser.id === this.message.user.id;
	}

	startEdit() {
		setMessageEditing(this.chat, this.message);
		Popper.hideAll();
	}

	onClickResend() {
		retryFailedQueuedMessage(this.chat, this.message);
	}

	onSingleLineModeChanged(singleLineMode: boolean) {
		this.singleLineMode = singleLineMode;
	}

	async removeMessage() {
		Popper.hideAll();

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to remove this message?`)
		);

		if (!result) {
			return;
		}

		setMessageEditing(this.chat, null);
		removeMessage(this.chat, this.room, this.message.id);
	}
}
