<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, PropType, ref, toRefs, watch } from 'vue';
import { useResizeObserver } from '../../../../../utils/resize-observer';
import { debounce } from '../../../../../utils/utils';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { Background } from '../../../../../_common/background/background.model';
import { formatDate } from '../../../../../_common/filters/date';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { PopperPlacementType } from '../../../../../_common/popper/AppPopper.vue';
import AppScrollScroller, {
	createScroller,
} from '../../../../../_common/scroll/AppScrollScroller.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { useEventSubscription } from '../../../../../_common/system/event/event-topic';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { illNoChat } from '../../../../img/ill/illustrations';
import { useGridStore } from '../../../grid/grid-store';
import { loadOlderChatMessages, onNewChatMessage } from '../../client';
import { TIMEOUT_CONSIDER_QUEUED } from '../../message';
import { ChatRoom } from '../../room';
import { ChatWindowAvatarSize } from '../variables';
import AppChatWindowOutputItem from './AppChatWindowOutputItem.vue';

const AUTOSCROLL_THRESHOLD = 10;
const MESSAGE_PADDING = 12;

const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	background: {
		type: Object as PropType<Background>,
		default: undefined,
	},
	overlay: {
		type: Boolean,
	},
	avatarPopperPlacement: {
		type: String as PropType<PopperPlacementType>,
		default: undefined,
	},
	avatarPopperPlacementFallbacks: {
		type: Array as PropType<PopperPlacementType[]>,
		default: undefined,
	},
});

const { room, background } = toRefs(props);
const { user } = useCommonStore();
const { chatUnsafe: chat } = useGridStore();

const widthWatcher = ref<HTMLDivElement>();

/** Whether or not we reached the end of the historical messages. */
const reachedEnd = ref(false);
const isLoadingOlder = ref(false);
const latestFrozenTimestamp = ref<Date>();
const maxContentWidth = ref(500);
const scroller = createScroller();

let _canAutoscroll = true;
let _checkQueuedTimeout: NodeJS.Timer | undefined;
let _isAutoscrolling = false;
let _isOnScrollQueued = false;
let _lastScrollMessageId: number | undefined;
let _lastAutoscrollOffset: number | undefined;

const messages = computed(() => room.value.messages);
const queuedMessages = computed(() => room.value.queuedMessages);

const oldestMessage = computed(() => (messages.value.length ? messages.value[0] : null));
const newestMessage = computed(() =>
	messages.value.length ? messages.value[messages.value.length - 1] : null
);

const allMessages = computed(() => [...messages.value, ...queuedMessages.value]);

// Fireside rooms delete older messages as newer ones arrive, so they can't load
// older.
const canLoadOlder = computed(
	() => !room.value.isFiresideRoom && !reachedEnd.value && !isLoadingOlder.value
);

const shouldShowIntro = computed(() => allMessages.value.length === 0);

const shouldShowNewMessagesButton = computed(() => {
	if (!latestFrozenTimestamp.value || !newestMessage.value) {
		return false;
	}

	return newestMessage.value.logged_on > latestFrozenTimestamp.value;
});

const roomChannel = computed(() => chat.value.roomChannels.get(room.value.id));

useEventSubscription(onNewChatMessage, async message => {
	// When the user sent a message, we want the chat to scroll all the way down
	// to show that message.
	if (user.value && message.user.id === user.value.id) {
		await nextTick();
		autoscroll();
	}
});

watch(queuedMessages, updateVisibleQueuedMessages, { deep: true });

onMounted(() => {
	_checkQueuedTimeout = setInterval(updateVisibleQueuedMessages, 1000);
	const _oldestId = oldestMessage.value?.id || -1;
	if (_oldestId !== -1) {
		_lastScrollMessageId = _oldestId;
	}

	useResizeObserver({
		target: widthWatcher,
		callback: debounce(onChatOutputResize, 500),
	});

	if (widthWatcher.value) {
		_updateMaxContentWidth(widthWatcher.value.clientWidth);
	}
});

onUnmounted(() => {
	if (_checkQueuedTimeout) {
		clearTimeout(_checkQueuedTimeout);
		_checkQueuedTimeout = undefined;
	}
});

function updateVisibleQueuedMessages() {
	// Display queued messages as queued that take longer than a certain amount
	// of ms for the server to reply to.
	for (const message of queuedMessages.value) {
		message._showAsQueued = Date.now() - message.logged_on.getTime() > TIMEOUT_CONSIDER_QUEUED;
	}
}

async function loadOlder() {
	isLoadingOlder.value = true;
	await nextTick();

	const el = scroller.element.value;
	if (!el) {
		return;
	}

	// Pulling the height after showing the loading allows us to scroll back
	// without it looking like it jumps.
	const startHeight = el.scrollHeight ?? 0;
	const firstMessage = oldestMessage.value;

	try {
		await loadOlderChatMessages(room.value);
	} catch (e) {
		console.error(e);
	}

	isLoadingOlder.value = false;
	await nextTick();

	// If the oldest message is the same, we need to mark that we reached the
	// end of the history so we don't continue loading more.
	if (firstMessage && oldestMessage.value?.id === firstMessage.id) {
		reachedEnd.value = true;
		return;
	}

	// After loading new messages we have to shift the scroll back down to where
	// we weren in the previous view of message history.
	const diff = el.scrollHeight - startHeight;
	el.scrollTop = diff;
}

/**
 * We watch when they scroll to see if they've moved away from the bottom of the
 * view. If they have, then we shouldn't autoscroll until they scroll back to
 * the bottom.
 */
function queueOnScroll() {
	if (_isOnScrollQueued) {
		return;
	}

	// Gather up all the scroll events that happen within a short time period
	// and process them as one "scroll." This tries to get around the fact that
	// ResizeObserver doesn't trigger as fast as onscroll does, so things
	// sometimes can get out of sync.
	_isOnScrollQueued = true;
	setTimeout(() => {
		onScroll();
		_isOnScrollQueued = false;
	}, 10);
}

function onScroll() {
	const el = scroller.element.value!;

	// If the scroll triggered because of us autoscrolling, we wanna discard it.
	if (_isAutoscrolling) {
		// Now that we caught it, we assume the autoscroll was finalized.
		_isAutoscrolling = false;
		return;
	}

	if (canLoadOlder.value && el.scrollTop === 0) {
		loadOlder();
		return;
	}

	// We skip checking the scroll if the element isn't scrollable yet. This'll
	// be the case if the height of the element is less than its scroll height.
	if (el.scrollHeight < el.offsetHeight) {
		return;
	}

	const offset = getOffsetFromBottom();

	if (room.value.isFiresideRoom) {
		const _lastOffset = _lastAutoscrollOffset ?? 0;
		const _lastId = _lastScrollMessageId;

		_lastAutoscrollOffset = offset;
		_lastScrollMessageId = oldestMessage.value?.id;

		// Check if our oldest message was automatically removed. Use our old
		// scroll offset to check if we were at the bottom of the screen.
		if (_lastOffset <= AUTOSCROLL_THRESHOLD && _lastId !== _lastScrollMessageId) {
			autoscroll();
			_lastAutoscrollOffset = getOffsetFromBottom();
			return;
		}
	}

	if (offset > AUTOSCROLL_THRESHOLD) {
		_freezeMessages(true);
	} else {
		_unfreezeMessages(true);
	}
}

function _freezeMessages(setScroll: boolean) {
	roomChannel.value?.freezeMessageLimitRemovals();
	latestFrozenTimestamp.value ??= messages.value[messages.value.length - 1].logged_on;
	if (setScroll) {
		_canAutoscroll = false;
	}
}

function _unfreezeMessages(setScroll: boolean) {
	if (setScroll) {
		_canAutoscroll = true;
	}
	latestFrozenTimestamp.value = undefined;
	roomChannel.value?.unfreezeMessageLimitRemovals();
}

function getOffsetFromBottom() {
	const el = scroller.element.value;
	if (!el) {
		return 0;
	}
	return el.scrollHeight - (el.scrollTop + el.offsetHeight);
}

async function tryAutoscroll() {
	if (_canAutoscroll) {
		autoscroll();
	}
}

async function autoscroll() {
	// We set that we've done an autoscroll. We'll check this variable in
	// the "scroll handler" and ignore the scroll event since it was
	// triggered by us.
	_isAutoscrolling = true;
	scroller.scrollTo(scroller.element.value!.scrollHeight + 10000);

	// Reset state
	_unfreezeMessages(false);
}

async function onClickNewMessages() {
	autoscroll();
	await nextTick();
	if (getOffsetFromBottom() < AUTOSCROLL_THRESHOLD) {
		_canAutoscroll = true;
	}
}

function onChatOutputResize(entries: ResizeObserverEntry[]) {
	if (entries.length === 0) {
		return;
	}

	_updateMaxContentWidth(entries[0].contentRect.width);
}

function onAvatarPopperShow() {
	// Freeze messages while we're showing an avatar popper.
	_freezeMessages(true);
}

function onAvatarPopperHide() {
	const allowAutoscroll = getOffsetFromBottom() < AUTOSCROLL_THRESHOLD;
	// Unfreeze messages after popper hides only if we're near enough to the
	// bottom of the chat scroller.
	if (allowAutoscroll) {
		_unfreezeMessages(allowAutoscroll);
		autoscroll();
	}
}

function _updateMaxContentWidth(width: number) {
	const chatInnerPadding = 12 * 2;
	const messageInnerPadding = MESSAGE_PADDING * 2;

	maxContentWidth.value = Math.max(
		width - (chatInnerPadding + ChatWindowAvatarSize + messageInnerPadding),
		100
	);
}
</script>

<template>
	<!--
	We need to autoscroll when either the scroller dimensions change--this will
	trigger when the send box changes size or when the window changes--and we
	need to autoscroll if the content changes within the scroller.
	-->
	<AppBackground class="chat-window-output" :background="background" darken>
		<div ref="widthWatcher" class="-width-watcher" />

		<AppScrollScroller
			v-app-observe-dimensions="tryAutoscroll"
			:controller="scroller"
			class="-scroller"
			@scroll="queueOnScroll"
		>
			<div
				v-app-observe-dimensions="tryAutoscroll"
				class="-container anim-fade-in no-animate-leave"
			>
				<div v-if="shouldShowIntro" class="-intro">
					<AppIllustration
						:asset="illNoChat"
						:class="{ '-illustration-overlay': overlay }"
					>
						<AppTranslate v-if="room.isPmRoom">
							Your friend is still loading. Encourage them with a message!
						</AppTranslate>
						<AppTranslate v-else-if="room.isFiresideRoom">
							Waiting for folks to load in. Spark the discussion with a message!
						</AppTranslate>
						<AppTranslate v-else>
							Waiting for friends to load in. Encourage them with a message!
						</AppTranslate>
					</AppIllustration>
				</div>

				<AppLoading v-if="isLoadingOlder" centered stationary hide-label />

				<div v-app-observe-dimensions="tryAutoscroll">
					<div v-for="message of allMessages" :key="message.id">
						<div v-if="message.dateSplit" class="-date-split">
							<span class="-bar" />
							<span class="-message">
								{{ formatDate(message.logged_on, 'mediumDate') }}
							</span>
							<span class="-bar" />
						</div>

						<hr
							v-if="!message.dateSplit && message.showMeta"
							class="-new-user-spacing"
						/>

						<AppChatWindowOutputItem
							:message="message"
							:room="room"
							:message-padding="MESSAGE_PADDING"
							:max-content-width="maxContentWidth"
							:avatar-popper-placement="avatarPopperPlacement"
							:avatar-popper-placement-fallbacks="avatarPopperPlacementFallbacks"
							@show-popper="onAvatarPopperShow"
							@hide-popper="onAvatarPopperHide"
						/>
					</div>
				</div>
			</div>
		</AppScrollScroller>

		<div v-if="shouldShowNewMessagesButton" class="-new-messages">
			<div class="-new-messages-tap-target" @click.stop="onClickNewMessages">
				<div class="-new-messages-button">
					<AppTranslate>New Messages</AppTranslate>
				</div>
			</div>
		</div>
	</AppBackground>
</template>

<style lang="stylus" scoped>
.chat-window-output
	position: relative
	height: 100%
	width: 100%

.-width-watcher
	position: absolute
	left: 0
	right: 0
	z-index: -1

.-scroller
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

.-new-messages
	position: absolute
	bottom: 0
	left: 0
	right: 0
	display: inline-flex
	justify-content: center

.-new-messages-tap-target
	padding: 8px

.-new-messages-button
	rounded-corners()
	cursor: pointer
	padding: 2px 4px
	font-size: 11px
	background-color: var(--theme-bi-bg)
	color: var(--theme-bi-fg)

.-container
	padding: $chat-room-window-padding
	position: relative

.-date-split
	position: relative
	display: flex
	align-items: center
	margin-top: $line-height-computed
	margin-bottom: $line-height-computed
	width: 100%
	text-align: center
	cursor: default

	& > .-bar
		background-color: rgba($black, 0.5)
		flex: auto
		height: $border-width-base

	& > .-message
		rounded-corners()
		background-color: rgba($black, 0.5)
		color: white
		position: relative
		padding: 8px 12px
		font-weight: bold
		font-size: 13px
		z-index: 1

.-new-user-spacing
	margin-top: 0
	margin-bottom: 0
	border: none
	height: 8px

.-intro
	display: flex
	align-items: center
	justify-content: center

.-illustration-overlay
	font-weight: bold

	&
	*
		overlay-text-shadow()
		color: white

.-message-chunk
	position: relative

.-avatar-scroller
	position: absolute
	left: 0
	top: 0
	bottom: 0
	width: 48px
	display: flex
	justify-content: center
	z-index: 4

.-avatar
	display: flex
	align-items: center
	justify-content: center

.-avatar-img
	z-index: 1
	img-circle()
	elevate-1()
</style>
