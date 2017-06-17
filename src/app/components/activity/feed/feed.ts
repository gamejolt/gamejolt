import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./feed.html';
import '../../../../lib/gj-lib-client/components/timeline-list/timeline-list.styl';

import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from './feed-container-service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppActivityFeedItem } from './item/item';

@View
@Component({
	components: {
		AppLoading,
		AppActivityFeedItem,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppActivityFeed extends Vue {
	@Prop(String) type: 'Notification' | 'Fireside_Post';
	@Prop(ActivityFeedContainer) feed: ActivityFeedContainer;
	@Prop(Boolean) showEditControls?: boolean;
	@Prop(Boolean) showGameInfo?: boolean;

	// TODO: Get this working through dashboard, yeah?
	// @Output( 'onPostRemoved' ) private _onPostRemoved = new EventEmitter<{ $post: FiresidePost }>();
	// @Output( 'onPostEdited' ) private _onPostEdited = new EventEmitter<{ $post: FiresidePost }>();
	// @Output( 'onPostPublished' ) private _onPostPublished = new EventEmitter<{ $post: FiresidePost }>();

	// We save the scroll position every time it changes. When clicking back to
	// the same feed we can scroll to the previous position that way.
	private scroll: number;
	private scroll$: Subscription | undefined;

	mounted() {
		this.scroll$ = Scroll.scrollChanges.subscribe(
			change => (this.scroll = change.top)
		);
	}

	destroyed() {
		this.feed.scroll = this.scroll;

		if (this.scroll$) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}
	}

	@Watch('feed', { immediate: true })
	async onItemsChanged(
		feed: ActivityFeedContainer,
		oldFeed: ActivityFeedContainer | undefined
	) {
		// Gotta make sure the feed has compiled.
		await this.$nextTick();

		// First time getting items in.
		// Let's try scrolling to a possible active one.
		// This will happen if they click away and back to the feed.
		if (feed.items.length && feed !== oldFeed) {
			this.initScroll();
		}
	}

	// TODO: This still some times doesn't scroll to the correct place.
	// It almost seems like the browser takes over and messes it all up.
	private initScroll() {
		console.log('init scroll!');
		const scroll = this.feed.scroll;
		if (scroll) {
			Scroll.to(scroll, { animate: false });
		}
	}

	get shouldShowLoadMore() {
		return !this.feed.reachedEnd && !this.feed.isLoadingMore;
	}

	// TODO: get these working
	onPostEdited(post: FiresidePost) {
		this.feed.update(post);
		this.$emit('postedited', post);
	}

	onPostPublished(post: FiresidePost) {
		this.$emit('postpublished', post);
	}

	onPostRemoved(post: FiresidePost) {
		this.feed.remove(post);
		this.$emit('postremoved', post);
	}

	loadMore() {
		this.feed.loadMore();
	}
}
