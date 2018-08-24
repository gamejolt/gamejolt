import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import { Subscription } from 'rxjs/Subscription';
import View from '!view!./output.html?style=./output.styl';

import { ChatMessage } from '../../message';
import { ChatRoom } from '../../room';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ChatClient } from '../../client';
import { date } from '../../../../../lib/gj-lib-client/vue/filters/date';
import { AppChatWindowOutputItem } from './item/item';

@View
@Component({
	components: {
		AppChatWindowOutputItem,
	},
	filters: {
		date,
	},
})
export class AppChatWindowOutput extends Vue {
	@Prop(ChatRoom) room!: ChatRoom;
	@Prop(Array) messages!: ChatMessage[];

	@State chat!: ChatClient;

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
		if (this.$el.scrollHeight < this.$el.offsetHeight) {
			return;
		}

		if (this.$el.scrollHeight - (this.$el.scrollTop + this.$el.offsetHeight) > 30) {
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
