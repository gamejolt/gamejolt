import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppScrollScroller from 'game-jolt-frontend-lib/components/scroll/scroller/scroller.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import { Subscription } from 'rxjs/Subscription';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ChatClient } from '../../client';
import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import AppChatWindowOutputItem from './item/item.vue';

@Component({
	components: {
		AppChatWindowOutputItem,
		AppScrollScroller,
	},
	filters: {
		date,
	},
})
export default class AppChatWindowOutput extends Vue {
	@Prop(ChatRoom)
	room!: ChatRoom;

	@Prop(Array)
	messages!: ChatMessage[];

	@State
	chat!: ChatClient;

	private shouldScroll = true;
	private resize$: Subscription | undefined;

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

	async onMessageTransition() {
		if (this.shouldScroll) {
			this.autoscroll();
		}
	}

	private autoscroll() {
		this.$el.scrollTop = this.$el.scrollHeight + 10000;
	}
}
