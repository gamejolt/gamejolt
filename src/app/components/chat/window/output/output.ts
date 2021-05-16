import Vue from 'vue';
import { Component, InjectReactive, Prop, Watch } from 'vue-property-decorator';
import { sleep } from '../../../../../utils/utils';
import { propRequired } from '../../../../../utils/vue';
import { date } from '../../../../../_common/filters/date';
import AppIllustration from '../../../../../_common/illustration/illustration.vue';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { AppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import {
	EventBus,
	EventBusDeregister,
} from '../../../../../_common/system/event/event-bus.service';
import { EventSubscription } from '../../../../../_common/system/event/event-topic';
import { ChatClient, ChatKey, ChatNewMessageEvent, loadOlderChatMessages } from '../../client';
import { ChatMessage, TIMEOUT_CONSIDER_QUEUED } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowOutputItem from './item/item.vue';

@Component({
	components: {
		AppLoading,
		AppChatWindowOutputItem,
		AppScrollScroller,
		AppIllustration,
	},
	directives: {
		AppObserveDimensions,
	},
	filters: {
		date,
	},
})
export default class AppChatWindowOutput extends Vue {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(Array)) messages!: ChatMessage[];
	@Prop(propRequired(Array)) queuedMessages!: ChatMessage[];

	@InjectReactive(ChatKey) chat!: ChatClient;

	@AppState
	user!: AppStore['user'];

	/** Whether or not we reached the end of the historical messages. */
	reachedEnd = false;
	isLoadingOlder = false;

	private checkQueuedTimeout?: NodeJS.Timer;
	private _introEmoji?: string;
	private newMessageDeregister?: EventBusDeregister;

	get allMessages() {
		return this.messages.concat(this.queuedMessages);
	}

	get canLoadOlder() {
		return !this.reachedEnd && !this.isLoadingOlder;
	}

	get shouldShowIntro() {
		return this.allMessages.length === 0;
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

	get hasNewMessages() {
		return this.chat.notifications[this.room.id] > 0;
	}

	private shouldScroll = true;
	private resize$: EventSubscription | undefined;

	async mounted() {
		this.resize$ = Screen.resizeChanges.subscribe(() => this.autoscroll());

		// Give it some time to render.
		await this.$nextTick();
		this.autoscroll();

		// Check every 100ms for which queued messages we should show.
		this.checkQueuedTimeout = setInterval(this.updateVisibleQueuedMessages, 100);

		this.newMessageDeregister = EventBus.on(
			'Chat.newMessage',
			async (event: ChatNewMessageEvent) => {
				// When the user sent a message, we want the chat to scroll all the way down to show that message.
				if (this.user && event.message.user.id === this.user.id) {
					await this.$nextTick();
					this.autoscroll();
				}
			}
		);
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}

		if (this.checkQueuedTimeout) {
			clearTimeout(this.checkQueuedTimeout);
			this.checkQueuedTimeout = undefined;
		}

		if (this.newMessageDeregister) {
			this.newMessageDeregister();
			this.newMessageDeregister = undefined;
		}
	}

	@Watch('queuedMessages')
	updateVisibleQueuedMessages() {
		// Display queued messages as queued that take longer than a certain amount of ms for the server to reply to.
		for (const message of this.queuedMessages) {
			message._showAsQueued =
				Date.now() - message.logged_on.getTime() > TIMEOUT_CONSIDER_QUEUED;
		}
	}

	/**
	 * We watch when they scroll to see if they've moved away from the
	 * bottom of the view. If they have, then we shouldn't autoscroll until
	 * they scroll back to the bottom.
	 */
	async onScroll() {
		// Sleep a short amount here.
		// Sometimes the send input or messages resize rapidly, too fast for the onResize events to fire.
		// In those cases, the onScroll would fire twice, and we don't autoscroll.
		// To combat those cases, we need to wait a short amount before trying to disable autoscroll here.
		await sleep(50);

		if (this.canLoadOlder && this.$el.scrollTop === 0) {
			this.loadOlder();
			return;
		}

		// We skip checking the scroll if the element isn't scrollable yet.
		// This'll be the case if the height of the element is less than its
		// scroll height.
		if (this.$el.scrollHeight < (this.$el as HTMLElement).offsetHeight) {
			return;
		}

		if (
			this.$el.scrollHeight - (this.$el.scrollTop + (this.$el as HTMLElement).offsetHeight) >
			30
		) {
			this.shouldScroll = false;
		} else {
			this.shouldScroll = true;
		}
	}

	async loadOlder() {
		this.isLoadingOlder = true;
		await this.$nextTick();

		// Pulling the height after showing the loading allows us to scroll back
		// without it looking like it jumps.
		const startHeight = this.$el.scrollHeight;
		const firstMessage = this.messages[0];

		try {
			await loadOlderChatMessages(this.chat, this.room.id);
		} catch (e) {
			console.error(e);
		}

		this.isLoadingOlder = false;
		await this.$nextTick();

		// If the oldest message is the same, we need to mark that we reached
		// the end of the history so we don't continue loading more.
		if (this.messages[0].id === firstMessage.id) {
			this.reachedEnd = true;
			return;
		}

		// After loading new messages we have to shift the scroll back down to
		// where we weren in the previous view of message history.
		const diff = this.$el.scrollHeight - startHeight;
		this.$el.scrollTop = diff;
	}

	private autoscroll() {
		this.$el.scrollTop = this.$el.scrollHeight + 10000;
	}

	public tryAutoscroll() {
		if (this.shouldScroll) {
			this.autoscroll();
		}
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
}
