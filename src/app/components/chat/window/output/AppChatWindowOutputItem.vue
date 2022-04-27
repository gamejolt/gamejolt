<script lang="ts" setup>
import { transparentize } from 'polished';
import { computed, inject, PropType, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { formatDate } from '../../../../../_common/filters/date';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import {
	removeMessage as chatRemoveMessage,
	retryFailedQueuedMessage,
	setMessageEditing,
	userCanModerateOtherUser,
} from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatUserPopover from '../../user-popover/user-popover.vue';

export interface ChatMessageEditEvent {
	message: ChatMessage;
}

const props = defineProps({
	message: {
		type: Object as PropType<ChatMessage>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	isNew: {
		type: Boolean,
		required: true,
	},
});

const { message, room, isNew } = toRefs(props);

const chatStore = inject<ChatStore>(ChatStoreKey)!;
const { theme, isDark } = useThemeStore();

const displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

const singleLineMode = ref(true);
const messageOptionsVisible = ref(false);

const chat = computed(() => chatStore.chat!);

// Use the form/page/user theme, or the default theme if none exist.
const actualTheme = computed(() => theme.value ?? DefaultTheme);

const isSingleLineMode = computed(() => {
	// We always want to be in multiline mode for phones:
	// It's expected behavior to create a new line with the "Enter" key on the virtual keyboard,
	// and send the message with a "send message" button.
	if (Screen.isMobile) {
		return false;
	}

	return singleLineMode.value;
});

const loggedOn = computed(() => {
	if (!room.value.shouldShowTimestamp) {
		return null;
	}

	return {
		template: formatDate(message.value.logged_on, 'shortTime'),
		tooltip: formatDate(message.value.logged_on, 'medium'),
	};
});

const isEditing = computed(() => chat.value.messageEditing === message.value);

/** The background-color for chat items that are being edited. */
const isEditingColor = computed(() => {
	if (!isEditing.value) {
		return undefined;
	}

	const highlight = '#' + actualTheme.value.highlight_;
	const backlight = '#' + actualTheme.value.backlight_;

	const tintColor = isDark.value ? highlight : backlight;
	return transparentize(0.85, tintColor);
});

const editingState = computed(() => {
	if (isEditing.value) {
		return {
			/** The text to display in the comment */
			display: '(editing...)',
			/** The tooltip to display on hover or tap */
			tooltip: '',
		};
	}

	if (message.value.edited_on) {
		return {
			display: '(edited)',
			tooltip: formatDate(message.value.edited_on!, 'medium'),
		};
	}

	return null;
});

const shouldShowMessageOptions = computed(() => canRemoveMessage.value || canEditMessage.value);

const canRemoveMessage = computed(() => {
	if (!chat.value.currentUser) {
		return false;
	}

	// The owner of the message can remove it.
	if (chat.value.currentUser.id === message.value.user.id) {
		return true;
	}

	// Mods/Room owners can also remove the message.
	return userCanModerateOtherUser(
		chat.value,
		room.value,
		chat.value.currentUser,
		message.value.user
	);
});

const canEditMessage = computed(() => {
	// Only content messages can be edited.
	if (message.value.type !== 'content') {
		return false;
	}

	if (!chat.value.currentUser) {
		return false;
	}

	// Only the owner of the message can edit.
	return chat.value.currentUser.id === message.value.user.id;
});

function startEdit() {
	setMessageEditing(chat.value, message.value);
	Popper.hideAll();
}

function onClickResend() {
	retryFailedQueuedMessage(chat.value, message.value);
}

function onSingleLineModeChanged(newVal: boolean) {
	singleLineMode.value = newVal;
}

async function removeMessage() {
	Popper.hideAll();

	const result = await ModalConfirm.show(
		$gettext(`Are you sure you want to remove this message?`)
	);

	if (!result) {
		return;
	}

	setMessageEditing(chat.value, null);
	chatRemoveMessage(chat.value, room.value, message.value.id);
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
			<AppPopper placement="right">
				<img
					class="img-responsive -chat-window-message-avatar-img"
					:src="message.user.img_avatar"
					alt=""
				/>
				<template #popover>
					<AppChatUserPopover :user="message.user" :room="room" />
				</template>
			</AppPopper>
		</a>

		<div class="chat-window-message-container">
			<div v-if="!message.combine" class="chat-window-message-byline">
				<RouterLink class="chat-window-message-user link-unstyled" :to="message.user.url">
					{{ message.user.display_name }}
				</RouterLink>
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
						<AppJolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-byline-notice"
					>
						<AppJolticon icon="broadcast" />
					</span>
				</span>
			</div>

			<div
				v-if="shouldShowMessageOptions"
				class="chat-window-message-options"
				:class="{ 'chat-window-message-options-open': messageOptionsVisible }"
			>
				<AppPopper
					@show="messageOptionsVisible = true"
					@hide="messageOptionsVisible = false"
				>
					<template #default>
						<a v-app-tooltip="$gettext('More Options')" class="link-muted">
							<AppJolticon icon="ellipsis-v" class="middle" />
						</a>
					</template>

					<template #popover>
						<div class="list-group">
							<a
								v-if="canEditMessage"
								class="list-group-item has-icon"
								@click="startEdit"
							>
								<AppJolticon icon="edit" />
								<AppTranslate>Edit Message</AppTranslate>
							</a>

							<a
								v-if="canRemoveMessage"
								class="list-group-item has-icon"
								@click="removeMessage"
							>
								<AppJolticon icon="remove" notice />
								<AppTranslate>Remove Message</AppTranslate>
							</a>
						</div>
					</template>
				</AppPopper>
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
						<AppJolticon icon="notice" notice />
					</span>
					<span
						v-else
						v-app-tooltip="$gettext(`Sending...`)"
						class="chat-window-message-queue-notice"
					>
						<AppJolticon icon="broadcast" />
					</span>
				</template>

				<AppContentViewer :source="message.content" :display-rules="displayRules" />

				<span
					v-if="editingState"
					v-app-tooltip.touchable="editingState.tooltip"
					class="-edited"
					:class="{ 'text-muted': !isEditing }"
				>
					<AppTranslate>{{ editingState.display }}</AppTranslate>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.chat-window-message
	position: relative
	margin-bottom: 8px
	padding-left: $chat-room-window-padding
	// This is so no height change occurs when the "NEW" indicator line appears
	border-top-width: 1px
	border-top-style: solid
	border-top-color: transparent

	@media $media-xs
		font-size: $font-size-small
		line-height: $font-size-small * 1.25

	&-avatar
		position: absolute
		left: $chat-room-window-padding
		bottom: 0
		width: $avatar-size
		height: $avatar-size
		z-index: 1

		& .-chat-window-message-avatar-img
			img-circle()
			elevate-1()

	&-container
		rounded-corners-lg()
		elevate-1()
		display: inline-block
		margin-left: $left-gutter-size - $chat-room-window-padding
		position: relative
		padding: 12px
		background-color: var(--theme-bg)

		@media $media-xs
			// On small screens, reduce the left side margin to make more space for the actual messages.
			margin-left: $avatar-size + 12px

	&-small-time
		position: absolute
		left: -($avatar-size) - ($left-gutter-size * 0.75)
		top: 6px
		font-size: $font-size-tiny
		theme-prop('color', 'fg-muted')
		opacity: 0
		user-select: none

		// Never show this on small devices. It's probably a phone anyway, and touch can't activate this.
		@media $media-xs
			display: none

	&-byline-error
		cursor: pointer
		vertical-align: middle

	&-byline-notice
		vertical-align: middle

	&-queue-error
		position: absolute
		left: -($avatar-size) - ($left-gutter-size * 0.5)
		top: 6px
		user-select: none
		cursor: pointer

		@media $media-xs
			left: -($left-gutter-size)

	&-queue-notice
		position: absolute
		left: -($avatar-size) - ($left-gutter-size * 0.5)
		top: 6px
		user-select: none

		@media $media-xs
			left: -($left-gutter-size)

	&-byline
		display: flex
		align-items: center
		margin-bottom: 4px

	&-user
		text-overflow()
		max-width: 200px
		font-weight: bold
		font-size: 13px

	&-username
		theme-prop('color', 'fg-muted')
		font-size: 11px
		margin-left: 4px
		cursor: default

	&-time
		theme-prop('color', 'fg-muted')
		margin-left: 8px
		font-size: 11px
		cursor: default

	// Some different styling for the fade collapse.
	.fade-collapse-collapsed
		theme-prop('border-bottom-color', 'light')
		margin-bottom: 4px
		border-bottom-width: $border-width-base
		border-bottom-style: dashed

		&::before
			theme-prop('background', 'darker', true)
			max-height: 4px !important

	&-options
		visibility: hidden
		position: absolute
		top: 0
		right: 0
		padding: 4px
		z-index: 2

		../:hover &
		.chat-window-message-editing &
		&-open
			visibility: visible

	&-retry
		font-size: $font-size-tiny

	&-content
		display: block
		// If we don't break words then it can make the window too large to try
		// to fit in the text. We also try to hyphenate.
		// Note: hyphens only works on Chrome in Mac and Android.
		// Luckily this is mostly where it matters.
		word-wrap: break-word
		hyphens: auto
		// Try to limit the effects of what zalgo text can do to chat.
		overflow: hidden

.-chat-message-queued
	color: var(--theme-fg-muted)

	.chat-window-message-avatar
		filter: grayscale(0.75) brightness(0.9)

	::v-deep(.content-image)
		filter: grayscale(0.75) brightness(0.9)

	::v-deep(.emoji)
		filter: grayscale(1) brightness(0.9)

	::v-deep(.content-gif)
		filter: grayscale(0.75) brightness(0.9)

.-chat-message-new
	border-top-color: var(--theme-notice)

	&::before
		content: 'NEW'
		position: absolute
		z-index: 2
		right: 0
		top: -7px
		font-size: 9px
		font-weight: bolder
		change-bg('notice')
		color: var(--theme-white)
		padding-left: 4px
		padding-right: 4px
		rounded-corners()
		line-height: 14px

.-edited
	font-size: $font-size-tiny
	cursor: default
	user-select: none
</style>
