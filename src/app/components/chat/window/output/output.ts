import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { EventSubscription } from '../../../../../system/event/event-topic';
import { propRequired } from '../../../../../utils/vue';
import { date } from '../../../../../_common/filters/date';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import { ChatClient, ChatKey, loadOlderChatMessages } from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowOutputItem from './item/item.vue';

@Component({
	components: {
		AppLoading,
		AppChatWindowOutputItem,
		AppScrollScroller,
	},
	filters: {
		date,
	},
})
export default class AppChatWindowOutput extends Vue {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propRequired(Array)) messages!: ChatMessage[];

	@InjectReactive(ChatKey) chat!: ChatClient;

	/** Whether or not we reached the end of the historical messages. */
	reachedEnd = false;
	isLoadingOlder = false;

	get canLoadOlder() {
		return !this.reachedEnd && !this.isLoadingOlder;
	}

	private shouldScroll = true;
	private resize$: EventSubscription | undefined;

	async mounted() {
		this.resize$ = Screen.resizeChanges.subscribe(() => this.autoscroll());

		// Give it some time to render.
		await this.$nextTick();
		this.autoscroll();
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	/**
	 * We watch when they scroll to see if they've moved away from the
	 * bottom of the view. If they have, then we shouldn't autoscroll until
	 * they scroll back to the bottom.
	 */
	onScroll() {
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

	async onMessageTransition() {
		if (this.shouldScroll) {
			this.autoscroll();
		}
	}

	private autoscroll() {
		this.$el.scrollTop = this.$el.scrollHeight + 10000;
	}
}
