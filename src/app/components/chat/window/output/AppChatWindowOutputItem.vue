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
import { DefaultTheme } from '../../../../../_common/theme/theme.model';
import { useThemeStore } from '../../../../../_common/theme/theme.store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import {
	removeMessage as chatRemoveMessage,
	setMessageEditing,
	userCanModerateOtherUser,
} from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatUserPopover from '../../user-popover/user-popover.vue';
import AppChatWindowOutputItemDetails from './AppChatWindowOutputItemDetails.vue';

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
});

const { message, room } = toRefs(props);

const chatStore = inject<ChatStore>(ChatStoreKey)!;
const { theme, isDark } = useThemeStore();

const displayRules = new ContentRules({ maxMediaWidth: 400, maxMediaHeight: 300 });

const root = ref<HTMLElement>();

const chat = computed(() => chatStore.chat!);

// Use the form/page/user theme, or the default theme if none exist.
const actualTheme = computed(() => theme.value ?? DefaultTheme);

const isEditing = computed(() => chat.value.messageEditing === message.value);

/** The background-color for chat items that are being edited. */
const isEditingColor = computed(() => {
	if (!isEditing.value) {
		return undefined;
	}

	const highlight = '#' + actualTheme.value.highlight_;
	const backlight = '#' + actualTheme.value.backlight_;

	const tintColor = isDark.value ? highlight : backlight;
	return transparentize(0.65, tintColor);
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
		ref="root"
		class="chat-window-output-item"
		:class="{
			'-message-queued': message._showAsQueued,
		}"
	>
		<a v-if="message.showAvatar" class="-avatar">
			<AppPopper placement="right">
				<img
					class="-avatar-img img-responsive"
					:src="message.user.img_avatar"
					alt=""
					draggable="false"
				/>

				<template #popover>
					<AppChatUserPopover :user="message.user" :room="room" />
				</template>
			</AppPopper>
		</a>

		<div class="-item-container-wrapper">
			<div
				class="-item-container"
				:style="{
					'background-image': isEditingColor
						? `linear-gradient(${isEditingColor}, ${isEditingColor}`
						: undefined,
				}"
			>
				<div v-if="message.showMeta" class="-item-byline">
					<RouterLink class="-user link-unstyled" :to="message.user.url">
						{{ message.user.display_name }}
					</RouterLink>
					<span class="-username"> @{{ message.user.username }} </span>
					<span>
						<AppChatWindowOutputItemDetails
							:message="message"
							:room="room"
							:timestamp-margin-left="8"
							show-am-pm
						/>
					</span>
				</div>

				<!-- TODO(chat-backgrounds) sizing is really jank with images
				and videos. They need to have an (almost) unrestricted width
				they can build to while still only taking up as much space as
				they need. Random issues with AppResponsiveDimensions not
				rebuilding when already at its parent bounds. -->
				<AppContentViewer :source="message.content" :display-rules="displayRules" />

				<span
					v-if="editingState"
					v-app-tooltip.touchable="editingState.tooltip"
					class="-edited"
					:class="{ 'text-muted': !isEditing }"
				>
					<AppTranslate>{{ editingState.display }}</AppTranslate>
				</span>

				<div v-if="!message.showMeta" class="-floating-data-left">
					<AppChatWindowOutputItemDetails :message="message" :room="room" />
				</div>
			</div>

			<div v-if="shouldShowMessageOptions" class="-floating-data-right">
				<div class="-message-actions">
					<a
						v-if="canEditMessage"
						class="-message-actions-item link-unstyled"
						@click="startEdit"
					>
						<AppJolticon icon="edit" />
					</a>

					<a
						v-if="canRemoveMessage"
						class="-message-actions-item link-unstyled"
						@click="removeMessage"
					>
						<!-- TODO(chat-backgrounds) trash jolticon -->
						<AppJolticon icon="remove" />
					</a>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.chat-window-output-item
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

	// Some different styling for the fade collapse.
	::v-deep(.fade-collapse-collapsed)
		theme-prop('border-bottom-color', 'light')
		margin-bottom: 4px
		border-bottom-width: $border-width-base
		border-bottom-style: dashed

		&::before
			theme-prop('background', 'darker', true)
			max-height: 4px !important

.-avatar
	position: absolute
	left: $chat-room-window-padding
	bottom: 0
	width: $avatar-size
	height: $avatar-size
	z-index: 1

	.-avatar-img
		img-circle()
		elevate-1()

.-item-container-wrapper
	display: flex
	align-items: flex-start

.-item-container
	rounded-corners-lg()
	elevate-1()
	display: inline-block
	margin-left: $left-gutter-size - $chat-room-window-padding
	position: relative
	padding: 12px
	background-color: var(--theme-bg)
	max-width: calc(100% - 24px)
	z-index: 1
	min-width: 24px

	@media $media-xs
		// On small screens, reduce the left side margin to make more space for the actual messages.
		margin-left: $avatar-size + 12px

.-item-byline
	display: flex
	align-items: center
	margin-bottom: 4px

.-user
	text-overflow()
	max-width: 200px
	font-weight: bold
	font-size: 13px

.-username
	theme-prop('color', 'fg-muted')
	font-size: 11px
	margin-left: 4px
	cursor: default

.-message-details
	theme-prop('color', 'fg-muted')
	font-size: 11px
	cursor: default

.-message-queued
	color: var(--theme-fg-muted)

	::v-deep(.content-image)
		filter: grayscale(0.75) brightness(0.9)

	::v-deep(.emoji)
		filter: grayscale(1) brightness(0.9)

	::v-deep(.content-gif)
		filter: grayscale(0.75) brightness(0.9)

.-edited
	font-size: $font-size-tiny
	cursor: default
	user-select: none

.-floating-data-left
.-floating-data-right
	top: 0
	white-space: nowrap
	opacity: 0
	z-index: 0
	display: inline-flex
	flex-direction: row
	gap: 8px
	align-items: center
	transition-property: opacity, transform, visibility
	transition-duration: 200ms
	transition-timing-function: $weak-ease-out
	visibility: hidden

.-floating-data-left
	position: absolute
	right: 100%
	transform: translateX(50%)
	width: $left-gutter-size - $chat-room-window-padding

.-floating-data-right
	position: relative
	left: -6px
	padding: 0 4px 0 14px
	transform: translateX(-50%)

.-message-actions
	rounded-corners()
	change-bg(bg-backdrop)
	elevate-1()
	overflow: hidden
	display: inline-flex
	flex-wrap: nowrap
	grid-template-columns: repeat(auto-fit, 1fr)

.-message-actions-item
	border-right: 1px solid var(--theme-bg-subtle)

	&:hover
		background-color: unquote('rgba(var(--theme-fg-rgb), 0.1)')

	&:last-child
		border-right: none

	::v-deep(.jolticon)
		padding: 8.5px 12px
		font-size: 16px
		margin: 0

.-item-container:hover
.-item-container-wrapper:hover
.-message-queued
	.-message-details
		visibility: visible

	.-floating-data-left
	.-floating-data-right
		opacity: 1
		transform: translateX(0%)
		visibility: visible

		::v-deep(.jolticon)
			margin: 0
			overlay-text-shadow()
</style>
