import Vue from 'vue';
import { Component, Emit, Inject, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { propOptional } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING } from '../../../../../_common/community/channel/channel-permissions';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import AppActivityFeedNewButton from '../../../../components/activity/feed/new-button/new-button.vue';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../../../components/lazy';
import AppPostAddButton from '../../../../components/post/add-button/add-button.vue';
import { Store } from '../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey, isVirtualChannel } from '../view.store';
import AppBlockedNotice from '../_blocked-notice/blocked-notice.vue';

@Component({
	components: {
		AppPostAddButton,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppActivityFeedNewButton,
		AppNavTabList,
		AppBlockedNotice,
		AppExpand,
	},
})
export default class AppCommunitiesViewFeed extends Vue {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	// It's optional since it may not have loaded into the page yet. In that
	// case, we show a placeholder and wait.
	@Prop(propOptional(ActivityFeedView)) feed?: ActivityFeedView;

	@AppState user!: AppStore['user'];
	@State communityStates!: Store['communityStates'];

	@Emit('add-post') emitAddPost(_post: FiresidePost) {}
	@Emit('load-new') emitLoadNew() {}

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get shouldShowPostAdd() {
		if (this.community.isBlocked) {
			return false;
		}

		// We always show the post add button for guests.
		if (!this.user) {
			return true;
		}

		if (isVirtualChannel(this.routeStore, this.channel)) {
			// Only show the post add if we have at least one target channel to
			// post to.
			if (this.community.channels) {
				return this.community.channels.some(i =>
					i.permissions.canPerform(COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING)
				);
			}
		} else {
			return this.channel.permissions.canPerform(
				COMMUNITY_CHANNEL_PERMISSIONS_ACTION_POSTING
			);
		}

		return true;
	}

	get shouldShowTabs() {
		return this.channel !== this.routeStore.frontpageChannel;
	}

	get placeholderText() {
		if (
			!!this.community.post_placeholder_text &&
			this.community.post_placeholder_text.length > 0
		) {
			return this.community.post_placeholder_text;
		}
		return this.$gettext(`Share your creations!`);
	}

	get noPostsMessage() {
		let message = this.placeholderText;
		// If the message does not end with one of those chars, append a `-` to separate it from the following text.
		if (!['!', '.', '?'].some(i => message.endsWith(i))) {
			message += ' -';
		}
		return message;
	}

	onLoadedNew() {
		// Mark the community/channel as read after loading new posts.
		Api.sendRequest(
			`/web/communities/mark-as-read/${this.community.path}/${this.channel.title}`,
			{},
			{ detach: true }
		);

		this.emitLoadNew();
	}

	onPostUnfeatured(eventItem: EventItem, community: Community) {
		if (
			this.feed &&
			this.channel === this.routeStore.frontpageChannel &&
			this.community.id === community.id
		) {
			this.feed.remove([eventItem]);
		}
	}

	onPostRejected(eventItem: EventItem, community: Community) {
		if (this.feed && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}

	onPostMovedChannel(eventItem: EventItem, movedTo: CommunityChannel) {
		if (
			this.feed &&
			this.community.id === movedTo.community_id &&
			!isVirtualChannel(this.routeStore, this.channel) &&
			this.channel.title !== movedTo.title
		) {
			this.feed.remove([eventItem]);
		}
	}
}
