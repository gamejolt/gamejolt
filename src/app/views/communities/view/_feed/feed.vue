<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import AppActivityFeedNewButton from '../../../../components/activity/feed/new-button/new-button.vue';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { AppActivityFeedLazy } from '../../../../components/lazy';
import AppPostAddButton from '../../../../components/post/add-button/add-button.vue';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';
import { useAppStore } from '../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey, isVirtualChannel } from '../view.store';
import AppBlockedNotice from '../_blocked-notice/blocked-notice.vue';

@Options({
	components: {
		AppPostAddButton,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppActivityFeedNewButton,
		AppNavTabList,
		AppBlockedNotice,
		AppExpand,
		AppIllustration,
	},
})
export default class AppCommunitiesViewFeed extends Vue {
	// It's optional since it may not have loaded into the page yet. In that
	// case, we show a placeholder and wait.
	@Prop(Object) feed?: ActivityFeedView;

	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get user() {
		return this.commonStore.user;
	}
	get communityStates() {
		return this.store.communityStates;
	}

	@Emit('add-post') emitAddPost(_post: FiresidePost) {}
	@Emit('load-new') emitLoadNew() {}

	readonly illNoCommentsSmall = illNoCommentsSmall;

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get tab() {
		if (this.$route.query.sort === 'hot') {
			return 'hot';
		}
		return 'new';
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
				return this.community.channels.some(i => i.canPost);
			}
		} else {
			return this.channel.canPost;
		}

		return true;
	}

	get shouldShowTabs() {
		if (this.channel === this.routeStore.frontpageChannel) {
			return false;
		}

		if (!this.feed || this.feed.hasItems) {
			return true;
		}

		return false;
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
</script>

<template>
	<div>
		<AppBlockedNotice :community="community" />

		<AppPostAddButton
			v-if="shouldShowPostAdd"
			:community="community"
			:channel="channel"
			:placeholder="placeholderText"
			@add="emitAddPost"
		/>

		<AppNavTabList v-if="shouldShowTabs">
			<ul>
				<li>
					<router-link
						v-app-track-event="`communities-feed:change-sort:new`"
						:to="{
							name: 'communities.view.channel',
							params: {
								channel: channel.title,
							},
						}"
						:class="{
							active: tab === 'new',
						}"
					>
						<AppTranslate>New</AppTranslate>
					</router-link>
				</li>
				<li>
					<router-link
						v-app-track-event="`communities-feed:change-sort:hot`"
						:to="{
							name: 'communities.view.channel',
							params: {
								channel: channel.title,
							},
							query: {
								sort: 'hot',
							},
						}"
						:class="{
							active: tab === 'hot',
						}"
					>
						<AppTranslate>Hot</AppTranslate>
					</router-link>
				</li>
			</ul>
		</AppNavTabList>

		<AppActivityFeedPlaceholder v-if="!feed" />
		<template v-else>
			<AppActivityFeed
				v-if="feed.hasItems"
				:feed="feed"
				show-ads
				@unfeature-post="onPostUnfeatured"
				@reject-post="onPostRejected"
				@move-channel-post="onPostMovedChannel"
				@load-new="onLoadedNew"
			/>
			<div v-else-if="channel !== routeStore.frontpageChannel">
				<div v-if="channel.canPost" v-translate="{ message: noPostsMessage }" class="alert">
					<b>There are no posts here yet.</b>
					What are you waiting for? %{ message } Make people happy.
				</div>
				<div v-else-if="channel.is_archived">
					<AppIllustration :asset="illNoCommentsSmall">
						<p>
							<AppTranslate>Shhh. This channel is archived.</AppTranslate>
						</p>
					</AppIllustration>
				</div>
				<div v-else v-translate class="alert">
					<AppTranslate>There are no posts in this channel.</AppTranslate>
				</div>
			</div>
			<div v-else class="alert">
				<div>
					<AppTranslate>There are no featured posts in this community.</AppTranslate>
				</div>
			</div>
		</template>
	</div>
</template>
