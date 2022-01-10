import { nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { formatDate } from '../../../../../_common/filters/date';
import AppIllustration from '../../../../../_common/illustration/illustration.vue';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { AppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppScrollScroller, {
	createScroller,
} from '../../../../../_common/scroll/scroller/scroller.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
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
		AppObserveDimensions,
	},
})
export default class AppChatWindowOutput extends Vue {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(Array)) messages!: ChatMessage[];
	@Prop(propRequired(Array)) queuedMessages!: ChatMessage[];

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	@AppState user!: AppStore['user'];

	/** Whether or not we reached the end of the historical messages. */
	reachedEnd = false;
	isLoadingOlder = false;
	shouldScroll = true;
	scroller = setup(() => createScroller());

	private checkQueuedTimeout?: NodeJS.Timer;
	private _introEmoji?: string;
	private isAutoscrolling = false;
	private isOnScrollQueued = false;

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
		// Check every 100ms for which queued messages we should show.
		this.checkQueuedTimeout = setInterval(this.updateVisibleQueuedMessages, 100);
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
		await nextTick();

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
		// If the scroll triggered because of us autoscrolling, we wanna discard it.
		if (this.isAutoscrolling) {
			// Now that we caught it, we assume the autoscroll was finalized.
			this.isAutoscrolling = false;
			return;
		}

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
			10
		) {
			this.shouldScroll = false;
		} else {
			this.shouldScroll = true;
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
		this.scroller.scrollTo(this.$el.scrollHeight + 10000);
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
