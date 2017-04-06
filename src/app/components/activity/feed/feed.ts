import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./feed.html';
import '../../timeline-list/timeline-list.styl';

import { Notification } from '../../../../lib/gj-lib-client/components/notification/notification-model';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedItem } from './item-service';
import { ActivityFeedContainer } from './feed-container-service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppActivityFeedNotification } from './notification/notification';
import { AppActivityFeedDevlogPost } from './devlog-post/devlog-post';
import { AppScrollInview } from '../../../../lib/gj-lib-client/components/scroll/inview/inview';

/**
 * The number of items from the bottom that we should hit before loading more.
 */
const LOAD_MORE_FROM_BOTTOM = 5;

/**
 * The number of times we should do an auto-load of items before stopping
 * and requiring them to do it manually.
 */
const LOAD_MORE_TIMES = 3;

@View
@Component({
	components: {
		AppLoading,
		AppActivityFeedNotification,
		AppActivityFeedDevlogPost,
		AppScrollInview,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppActivityFeed extends Vue
{
	@Prop( String ) type: 'Notification' | 'Fireside_Post';
	@Prop( ActivityFeedContainer ) feed: ActivityFeedContainer;
	@Prop( String ) loadMoreUrl: string;
	@Prop( Boolean ) showEditControls?: boolean;
	@Prop( Boolean ) showGameInfo?: boolean;
	@Prop( Boolean ) disableAutoload?: boolean;

	// TODO: Get this working through dashboard, yeah?
	// @Output( 'onPostRemoved' ) private _onPostRemoved = new EventEmitter<{ $post: FiresidePost }>();
	// @Output( 'onPostEdited' ) private _onPostEdited = new EventEmitter<{ $post: FiresidePost }>();
	// @Output( 'onPostPublished' ) private _onPostPublished = new EventEmitter<{ $post: FiresidePost }>();

	isLoadingMore = false;

	private inView: { [k: string]: ActivityFeedItem } = {};
	private timesLoaded = 0;

	// We save the scroll position every time it changes. When clicking back to
	// the same feed we can scroll to the previous position that way.
	private scroll: number;
	private scroll$: Subscription | undefined;

	mounted()
	{
		this.scroll$ = Scroll.scrollChanges.subscribe(
			( change ) => this.scroll = change.top,
		);
	}

	destroyed()
	{
		this.feed.scroll = this.scroll;

		if ( this.scroll$ ) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}
	}

	@Watch( 'feed', { immediate: true } )
	async onItemsChanged( feed: ActivityFeedContainer, oldFeed: ActivityFeedContainer | undefined )
	{
		// Gotta make sure the feed has compiled.
		await this.$nextTick();
		this.isLoadingMore = false;

		// First time getting items in.
		// Let's try scrolling to a possible active one.
		// This will happen if they click away and back to the feed.
		if ( feed.items.length && feed !== oldFeed ) {
			this.initScroll();
		}
	}

	// TODO: This still some times doesn't scroll to the correct place.
	// It almost seems like the browser takes over and messes it all up.
	private initScroll()
	{
		const scroll = this.feed.scroll;
		if ( scroll ) {
			Scroll.to( scroll, { animate: false } );
		}
	}

	isItemUnread( item: ActivityFeedItem )
	{
		// Only care if there is a watermark.
		if ( this.feed.notificationWatermark === 0 ) {
			return false;
		}

		if ( item.feedItem instanceof Notification ) {
			return item.feedItem.added_on > this.feed.notificationWatermark;
		}
		else if ( item.feedItem instanceof FiresidePost ) {
			return item.feedItem.published_on > this.feed.notificationWatermark;
		}
	}

	isItemInView( item: ActivityFeedItem )
	{
		return !!this.inView[ item.id ];
	}

	setActive( item: ActivityFeedItem )
	{
		this.feed.activeItem = item;
	}

	onPostEdited( post: FiresidePost )
	{
		this.feed.update( post );
		this.$emit( 'postedited', post );
	}

	onPostPublished( post: FiresidePost )
	{
		this.$emit( 'postpublished', post );
	}

	onPostRemoved( post: FiresidePost )
	{
		this.feed.remove( post );
		this.$emit( 'postremoved', post );
	}

	async loadMore()
	{
		if ( this.isLoadingMore || this.feed.reachedEnd ) {
			return;
		}

		this.isLoadingMore = true;
		++this.timesLoaded;

		const lastPost = this.feed.items[ this.feed.items.length - 1 ];

		const response = await Api.sendRequest( this.loadMoreUrl, { scrollId: lastPost.scrollId } );

		this.isLoadingMore = false;

		if ( !response.items || !response.items.length ) {
			this.feed.reachedEnd = true;
			return;
		}

		if ( this.type === 'Notification' ) {
			this.feed.append( Notification.populate( response.items ) );
		}
		else if ( this.type === 'Fireside_Post' ) {
			this.feed.append( FiresidePost.populate( response.items ) );
		}
	}

	onItemInViewChange( visible: boolean, item: ActivityFeedItem )
	{
		if ( visible ) {
			Vue.set( this.inView, item.id, item );
			this.feed.viewed( item );

			// Auto-loading while scrolling.
			if ( !this.disableAutoload && !this.isLoadingMore && !this.feed.reachedEnd && this.timesLoaded < LOAD_MORE_TIMES ) {
				const index = this.feed.items.findIndex( ( _item ) => _item.id === item.id );
				if ( index >= this.feed.items.length - LOAD_MORE_FROM_BOTTOM ) {
					this.loadMore();
				}
			}
		}
		else {
			Vue.delete( this.inView, item.id );
		}
	}

	onItemExpanded( item: ActivityFeedItem )
	{
		this.feed.expanded( item );
	}
}
