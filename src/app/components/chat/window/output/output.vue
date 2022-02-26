<script lang="ts">
import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { formatDate } from '../../../../../_common/filters/date';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppScrollScroller, {
	createScroller,
} from '../../../../../_common/scroll/AppScrollScroller.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { useEventSubscription } from '../../../../../_common/system/event/event-topic';
import { illNoChat } from '../../../../img/ill/illustrations';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { loadOlderChatMessages, onNewChatMessage } from '../../client';
import { ChatMessage, TIMEOUT_CONSIDER_QUEUED } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowOutputItem from './item/item.vue';

@Options({
	components: {
		AppLoading,
		AppChatWindowOutputItem,
		AppScrollScroller,
		AppIllustration,
	},
	directives: {
		AppObserveDimensions: vAppObserveDimensions,
	},
})
export default class AppChatWindowOutput extends Vue {
	@Prop({ type: Object, required: true }) room!: ChatRoom;
	@Prop({ type: Array, required: true }) messages!: ChatMessage[];
	@Prop({ type: Array, required: true }) queuedMessages!: ChatMessage[];

	commonStore = setup(() => useCommonStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get user() {
		return this.commonStore.user;
	}

	/** Whether or not we reached the end of the historical messages. */
	reachedEnd = false;
	isLoadingOlder = false;
	shouldScroll = true;
	scroller = shallowSetup(() => createScroller());

	private checkQueuedTimeout?: NodeJS.Timer;
	private _introEmoji?: string;
	private isAutoscrolling = false;
	private isOnScrollQueued = false;

	private _lastScrollMessageId?: number;
	private _lastAutoscrollOffset?: number;

	latestFrozenTimestamp: Date | null = null;

	readonly formatDate = formatDate;
	readonly illNoChat = illNoChat;

	get chat() {
		return this.chatStore.chat!;
	}

	get allMessages() {
		return this.messages.concat(this.queuedMessages);
	}

	get canLoadOlder() {
		// Fireside rooms delete older messages as newer ones arrive, so they can't load older.
		return !this.room.isFiresideRoom && !this.reachedEnd && !this.isLoadingOlder;
	}

	get shouldShowIntro() {
		return this.allMessages.length === 0;
	}

	get shouldShowNewMessagesButton() {
		if (!this.latestFrozenTimestamp) {
			return false;
		}

		return this.messages[this.messages.length - 1].logged_on > this.latestFrozenTimestamp;
	}

	get introEmoji() {
		if (this._introEmoji === undefined) {
			const emojis = ['ohyou', 'smile', 'bucktooth', 'mah', 'grin', 'psychotic'];
			let emojiIndex = 0;

			if (this.room.user) {
				emojiIndex = this.room.user.id % emojis.length;
			} else {
				emojiIndex = Math.floor(Math.random() * emojis.length);
			}

			this._introEmoji = emojis[emojiIndex];
		}

		return this._introEmoji;
	}

	created() {
		useEventSubscription(onNewChatMessage, async message => {
			// When the user sent a message, we want the chat to scroll all
			// the way down to show that message.
			if (this.user && message.user.id === this.user.id) {
				await nextTick();
				this.autoscroll();
			}
		});
	}

	mounted() {
		this.checkQueuedTimeout = setInterval(this.updateVisibleQueuedMessages, 1000);
		if (this.messages.length > 0) {
			this._lastScrollMessageId = this.messages[0].id;
		}
	}

	unmounted() {
		if (this.checkQueuedTimeout) {
			clearTimeout(this.checkQueuedTimeout);
			this.checkQueuedTimeout = undefined;
		}
	}

	@Watch('queuedMessages', { deep: true })
	updateVisibleQueuedMessages() {
		// Display queued messages as queued that take longer than a certain amount of ms for the server to reply to.
		for (const message of this.queuedMessages) {
			message._showAsQueued =
				Date.now() - message.logged_on.getTime() > TIMEOUT_CONSIDER_QUEUED;
		}
	}

	async loadOlder() {
		this.isLoadingOlder = true;
		await nextTick();

		const el = this.scroller.element.value!;

		// Pulling the height after showing the loading allows us to scroll back
		// without it looking like it jumps.
		const startHeight = el.scrollHeight ?? 0;
		const firstMessage = this.messages[0];

		try {
			await loadOlderChatMessages(this.chat, this.room.id);
		} catch (e) {
			console.error(e);
		}

		this.isLoadingOlder = false;
		await nextTick();

		// If the oldest message is the same, we need to mark that we reached
		// the end of the history so we don't continue loading more.
		if (this.messages[0].id === firstMessage.id) {
			this.reachedEnd = true;
			return;
		}

		// After loading new messages we have to shift the scroll back down to
		// where we weren in the previous view of message history.
		const diff = el.scrollHeight - startHeight;
		el.scrollTop = diff;
	}

	/**
	 * We watch when they scroll to see if they've moved away from the bottom of
	 * the view. If they have, then we shouldn't autoscroll until they scroll
	 * back to the bottom.
	 */
	queueOnScroll() {
		if (this.isOnScrollQueued) {
			return;
		}

		// Gather up all the scroll events that happen within a short time
		// period and process them as one "scroll." This tries to get around the
		// fact that ResizeObserver doesn't trigger as fast as onscroll does, so
		// things sometimes can get out of sync.
		this.isOnScrollQueued = true;
		setTimeout(() => {
			this.onScroll();
			this.isOnScrollQueued = false;
		}, 10);
	}

	private onScroll() {
		const el = this.scroller.element.value!;

		// If the scroll triggered because of us autoscrolling, we wanna discard it.
		if (this.isAutoscrolling) {
			// Now that we caught it, we assume the autoscroll was finalized.
			this.isAutoscrolling = false;
			return;
		}

		if (this.canLoadOlder && el.scrollTop === 0) {
			this.loadOlder();
			return;
		}

		// We skip checking the scroll if the element isn't scrollable yet.
		// This'll be the case if the height of the element is less than its
		// scroll height.
		if (el.scrollHeight < el.offsetHeight) {
			return;
		}

		const getOffsetFromBottom = () => {
			const { scrollHeight, scrollTop, offsetHeight } = el;
			return scrollHeight - (scrollTop + offsetHeight);
		};

		const offset = getOffsetFromBottom();
		const threshold = 10;

		if (this.room.isFiresideRoom) {
			const _lastOffset = this._lastAutoscrollOffset ?? 0;
			const _lastId = this._lastScrollMessageId;

			this._lastAutoscrollOffset = offset;
			this._lastScrollMessageId = this.messages[0].id;

			// Check if our oldest message was automatically removed. Use our
			// old scroll offset to check if we were at the bottom of the screen.
			if (_lastOffset <= threshold && _lastId !== this._lastScrollMessageId) {
				this.autoscroll();
				this._lastAutoscrollOffset = getOffsetFromBottom();
				return;
			}
		}

		const roomChannel = this.chat.roomChannels[this.room.id];

		if (offset > threshold) {
			roomChannel.freezeMessageLimitRemovals();
			this.latestFrozenTimestamp ??= this.messages[this.messages.length - 1].logged_on;
			this.shouldScroll = false;
		} else {
			this.shouldScroll = true;
			this.latestFrozenTimestamp = null;
			roomChannel.unfreezeMessageLimitRemovals();
		}
	}

	public async tryAutoscroll() {
		if (this.shouldScroll) {
			this.autoscroll();
		}
	}

	private autoscroll() {
		// We set that we've done an autoscroll. We'll check this variable in
		// the "scroll handler" and ignore the scroll event since it was
		// triggered by us.
		this.isAutoscrolling = true;
		this.scroller.scrollTo(this.scroller.element.value!.scrollHeight + 10000);

		// Reset state
		this.shouldScroll = true;
		this.latestFrozenTimestamp = null;
		this.chat.roomChannels[this.room.id].unfreezeMessageLimitRemovals();
	}

	isNewMessage(message: ChatMessage) {
		const newCount = this.chat.notifications[this.room.id];
		if (newCount === 0) {
			return false;
		}

		// Use messages, don't consider queued messages here.
		const position = this.messages.indexOf(message);
		return this.messages.length - position === newCount;
	}

	onClickNewMessages() {
		this.autoscroll();
	}
}
</script>

<template>
	<!--
	We need to autoscroll when either the scroller dimensions change--this will
	trigger when the send box changes size or when the window changes--and we
	need to autoscroll if the content changes within the scroller.
	-->
	<div class="-scroll-container">
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
					<AppIllustration :src="illNoChat">
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

				<AppLoading v-if="isLoadingOlder" class="loading-centered" />

				<div v-app-observe-dimensions="tryAutoscroll">
					<div v-for="message of allMessages" :key="message.id">
						<div v-if="message.dateSplit" class="-date-split">
							<span class="-inner">{{
								formatDate(message.logged_on, 'mediumDate')
							}}</span>
						</div>

						<hr v-if="!message.dateSplit && !message.combine" class="-hr" />

						<AppChatWindowOutputItem
							:message="message"
							:room="room"
							:is-new="isNewMessage(message)"
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
	</div>
</template>

<style lang="stylus" scoped>
.-scroll-container
	position: relative
	height: 100%
	width: 100%

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
	padding-left: 0
	position: relative

.-date-split
	position: relative
	display: block
	margin-top: $line-height-computed
	margin-bottom: $line-height-computed
	width: 100%
	text-align: center
	cursor: default

	&::before
		border-bottom-color: var(--theme-bg-offset)
		content: ''
		position: absolute
		left: 0
		right: 0
		top: 50%
		margin-top: 0
		height: 0
		border-bottom-width: $border-width-large
		border-bottom-style: solid
		z-index: 0

	& > .-inner
		change-bg('bg-offset')
		color: var(--theme-fg-muted)
		position: relative
		padding-left: 8px
		padding-right: 8px
		font-weight: bold
		font-size: $font-size-small
		z-index: 1
		rounded-corners()

.-hr
	margin-top: 0
	margin-bottom: 0
	border: none
	height: $line-height-computed * 0.5

.-intro
	display: flex
	align-items: center
	justify-content: center
	padding-left: $chat-room-window-padding
</style>
