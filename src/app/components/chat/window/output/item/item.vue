<script lang="ts">
import { transparentize } from 'polished';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { ContentRules } from '../../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../../_common/content/content-viewer/content-viewer.vue';
import { formatDate } from '../../../../../../_common/filters/date';
import { ModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { Popper } from '../../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { DefaultTheme } from '../../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../../_common/theme/theme.store';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../../chat-store';
import {
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

@Options({
	components: {
		AppContentViewer,
		AppPopper,
		AppChatUserPopover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatWindowOutputItem extends Vue {
	@Prop(Object) message!: ChatMessage;
	@Prop(Object) room!: ChatRoom;
	@Prop({ type: Boolean, required: true }) isNew!: boolean;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	themeStore = setup(() => useThemeStore());

	singleLineMode = true;
	messageOptionsVisible = false;

	readonly formatDate = formatDate;
	readonly ChatMessage = ChatMessage;
	readonly displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });
	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat!;
	}

	get actualTheme() {
		// Use the form/page/user theme, or the default theme if none exist.
		return this.themeStore.theme ?? DefaultTheme;
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
		if (!this.room.shouldShowTimestamp) {
			return null;
		}

		return {
			template: formatDate(this.message.logged_on, 'shortTime'),
			tooltip: formatDate(this.message.logged_on, 'medium'),
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

		const tintColor = this.themeStore.isDark ? highlight : backlight;
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
				tooltip: formatDate(this.message.edited_on!, 'medium'),
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
</script>

<template>
	<div
		class="chat-window-message"
		:class="{
			'chat-window-message-not-combined': !message.combine,
			'chat-window-message-combined': message.combine,
			'chat-window-message-editing': isEditing,
			'-chat-message-queued': message._showAsQueued,
			'-chat-message-new': isNew,
			'chat-window-message-options-visible': messageOptionsVisible,
		}"
		:style="{ 'background-color': isEditingColor }"
	>
		<a v-if="!message.combine" class="chat-window-message-avatar">
			<app-popper placement="right">
				<img
					class="img-responsive -chat-window-message-avatar-img"
					:src="message.user.img_avatar"
					alt=""
				/>
				<template #popover>
					<app-chat-user-popover :user="message.user" :room="room" />
				</template>
			</app-popper>
		</a>

		<div class="chat-window-message-container">
			<div v-if="!message.combine" class="chat-window-message-byline">
				<router-link class="chat-window-message-user link-unstyled" :to="message.user.url">
					{{ message.user.display_name }}
				</router-link>
				<span class="chat-window-message-username"> @{{ message.user.username }} </span>
				<span class="chat-window-message-time">
					<template v-if="!message._showAsQueued">
						<span v-if="loggedOn !== null" v-app-tooltip="loggedOn.tooltip">
							{{ loggedOn.template }}
						</span>
					</template>
					<span
						v-else-if="message._error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						class="chat-window-message-byline-error"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-byline-notice"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</span>
			</div>

			<div
				v-if="shouldShowMessageOptions"
				class="chat-window-message-options"
				:class="{ 'chat-window-message-options-open': messageOptionsVisible }"
			>
				<app-popper
					@show="messageOptionsVisible = true"
					@hide="messageOptionsVisible = false"
				>
					<template #default>
						<a v-app-tooltip="$gettext('More Options')" class="link-muted">
							<app-jolticon icon="ellipsis-v" class="middle" />
						</a>
					</template>

					<template #popover>
						<div class="list-group">
							<a
								v-if="canEditMessage"
								class="list-group-item has-icon"
								@click="startEdit"
							>
								<app-jolticon icon="edit" />
								<translate>Edit Message</translate>
							</a>

							<a
								v-if="canRemoveMessage"
								class="list-group-item has-icon"
								@click="removeMessage"
							>
								<app-jolticon icon="remove" notice />
								<translate>Remove Message</translate>
							</a>
						</div>
					</template>
				</app-popper>
			</div>

			<div class="chat-window-message-content-wrap">
				<template v-if="message.combine">
					<template v-if="!message._showAsQueued">
						<span
							v-if="loggedOn !== null"
							v-app-tooltip="loggedOn.tooltip"
							class="chat-window-message-small-time"
						>
							{{ loggedOn.template }}
						</span>
					</template>
					<span
						v-else-if="message._error"
						v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
						class="chat-window-message-queue-error"
						@click="onClickResend"
					>
						<app-jolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-queue-notice"
					>
						<app-jolticon icon="broadcast" />
					</span>
				</template>

				<app-content-viewer :source="message.content" :display-rules="displayRules" />

				<span
					v-if="editingState"
					v-app-tooltip.touchable="editingState.tooltip"
					class="-edited"
					:class="{ 'text-muted': !isEditing }"
				>
					<translate>{{ editingState.display }}</translate>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./item.styl" scoped></style>
