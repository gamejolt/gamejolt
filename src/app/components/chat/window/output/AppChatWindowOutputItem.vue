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
	retryFailedQueuedMessage,
	setMessageEditing,
	userCanModerateOtherUser,
} from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';

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

const root = ref<HTMLElement>();
const headerData = ref<HTMLElement>();
const floatingData = ref<HTMLElement>();

const messageOptionsVisible = ref(false);

const chat = computed(() => chatStore.chat!);

// Use the form/page/user theme, or the default theme if none exist.
const actualTheme = computed(() => theme.value ?? DefaultTheme);

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

function onClickResend() {
	retryFailedQueuedMessage(chat.value, message.value);
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
			'-message-new': isNew,
			'-message-queued': message._showAsQueued,
			'-options-visible': messageOptionsVisible,
		}"
	>
		<!--
		    Teleports to either the header content or a display-on-hover flyout
			display
		-->
		<Teleport v-if="headerData || floatingData" :to="headerData || floatingData">
			<div class="-message-details">
				<template v-if="!message._showAsQueued">
					<span
						v-if="loggedOn !== null"
						v-app-tooltip="loggedOn.tooltip"
						:style="headerData ? { marginLeft: '8px' } : undefined"
					>
						{{ loggedOn.template }}
					</span>
				</template>
				<span
					v-else-if="message._error"
					v-app-tooltip="$gettext(`Failed to send. Press to retry`)"
					class="-byline-error"
					@click="onClickResend"
				>
					<AppJolticon icon="notice" notice />
				</span>
				<span v-else v-app-tooltip="$gettext(`Sending...`)" class="-byline-notice">
					<AppJolticon icon="broadcast" />
				</span>
			</div>
		</Teleport>

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
					<span ref="headerData">
						<!-- Teleport target -->
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
			</div>

			<div ref="floatingData" class="-floating-data">
				<!-- Teleport target -->

				<AppPopper
					v-if="shouldShowMessageOptions"
					:style="{
						// Place this below teleported elements
						order: 1,
					}"
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
	min-width: 50px

	@media $media-xs
		// On small screens, reduce the left side margin to make more space for the actual messages.
		margin-left: $avatar-size + 12px

.-byline-error
	cursor: pointer
	vertical-align: middle

.-byline-notice
	vertical-align: middle

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

.-message-new
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

.-floating-data
	position: relative
	top: 4px
	left: -6px
	white-space: nowrap
	opacity: 0
	z-index: 0
	display: inline-flex
	flex-direction: column
	transform: translateX(-100%)
	padding: 0 4px 0 14px
	transition-property: opacity, transform
	transition-duration: 200ms
	transition-timing-function: $weak-ease-out

.-item-container:hover
.-item-container-wrapper:hover
.-options-visible
.-message-queued
	.-message-details
		visibility: visible

	.-floating-data
		opacity: 1
		transform: translateX(0%)

		::v-deep(.jolticon)
			margin: 0
			overlay-text-shadow()
</style>
