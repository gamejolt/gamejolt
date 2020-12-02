import { transparentize } from 'polished';
import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
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
	acceptInvite,
	ChatClient,
	ChatKey,
	enterChatRoom,
	fetchInviteInfo,
	removeMessage,
	retryFailedQueuedMessage,
	setMessageEditing,
} from '../../../client';
import { ChatMessage, ChatMessageType } from '../../../message';
import { ChatRoom, getChatRoomTitle } from '../../../room';

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

	@ThemeState theme?: ThemeStore['theme'];
	@ThemeState isDark?: ThemeStore['isDark'];

	readonly date = date;
	readonly ChatMessage = ChatMessage;
	readonly ChatMessageType = ChatMessageType;
	readonly displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

	optionsVisible = false;
	singleLineMode = true;
	isInviteMessageAccepted = false;
	isInviteExpired = false;
	invitedRoom: ChatRoom | null = null;

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

	get isInviteSender() {
		return this.chat.currentUser && this.message.user.id === this.chat.currentUser.id;
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

	get invitedRoomTitle() {
		if (!this.invitedRoom) {
			return this.$gettext(`Group Chat`);
		}

		return getChatRoomTitle(this.invitedRoom);
	}

	get loadedInvitedRoom() {
		return this.invitedRoom !== null;
	}

	get canEnterInviteRoom() {
		return this.isInviteSender || this.isInviteMessageAccepted;
	}

	async mounted() {
		if (this.message.type === ChatMessageType.INVITE) {
			try {
				const payload = await fetchInviteInfo(this.chat, this.message);
				this.isInviteMessageAccepted = payload.role !== 'pending';
				this.invitedRoom = new ChatRoom(payload.room);
				console.log(payload.room);
			} catch (error) {
				// An error in fetching could mean that they joined the group and then left.
				// That removes all roles they have in the room, so we don't know if they are
				// still allowed to view the info with this invite. The other user has to send
				// a new invite.
				this.isInviteExpired = true;
			}
		}
	}

	acceptInvite(msgId: number) {
		acceptInvite(this.chat, msgId);
		this.isInviteMessageAccepted = true;
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
			this.$gettext(`Are you sure you want to remove this message?`),
			undefined,
			'yes'
		);

		if (!result) {
			return;
		}

		setMessageEditing(this.chat, null);
		removeMessage(this.chat, this.message.id);
	}

	onShowOptions() {
		this.optionsVisible = true;
	}

	onHideOptions() {
		this.optionsVisible = false;
	}

	enterInviteRoom() {
		if (this.invitedRoom && this.canEnterInviteRoom) {
			enterChatRoom(this.chat, this.invitedRoom.id);
		}
	}
}
