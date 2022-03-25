<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationDefinition } from '../../../../../utils/router';
import { trackPostOpen } from '../../../../../_common/analytics/analytics.service';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityPill from '../../../../../_common/community/pill/pill.vue';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import AppPostCard from '../../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/AppMediaItemBackdrop.vue';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppPill from '../../../../../_common/pill/AppPill.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import AppStickerControlsOverlay from '../../../../../_common/sticker/controls-overlay/controls-overlay.vue';
import { canPlaceStickerOnFiresidePost } from '../../../../../_common/sticker/placement/placement.model';
import AppStickerReactions from '../../../../../_common/sticker/reactions/reactions.vue';
import {
	createStickerTargetController,
	provideStickerTargerController,
	StickerTargetController,
} from '../../../../../_common/sticker/target/target-controller';
import AppStickerTarget from '../../../../../_common/sticker/target/target.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserFollowWidget from '../../../../../_common/user/follow/widget.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import AppFiresidePostEmbed from '../../../fireside/post/embed/embed.vue';
import AppPollVoting from '../../../poll/voting/voting.vue';
import AppPostControls from '../../../post/controls/controls.vue';
import { feedShouldBlockPost } from '../feed-service';
import type { ActivityFeedInterface } from '../feed.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedPostMedia from '../post/media/media.vue';
import AppActivityFeedPostText from '../post/text/text.vue';
import AppActivityFeedPostVideo from '../post/video/video.vue';
import { ActivityFeedInterfaceKey, ActivityFeedKey, ActivityFeedView } from '../view';
import AppActivityFeedPostBlocked from './blocked/blocked.vue';
import AppActivityFeedPostTime from './time/time.vue';

@Options({
	components: {
		AppActivityFeedPostTime,
		AppUserAvatar,
		AppUserFollowWidget,
		AppActivityFeedPostMedia,
		AppActivityFeedPostVideo,
		AppActivityFeedPostText,
		AppPostControls,
		AppStickerControlsOverlay,
		AppPollVoting,
		AppUserCardHover,
		AppFadeCollapse,
		AppCommunityPill,
		AppPill,
		AppContentViewer,
		AppUserVerifiedTick,
		AppActivityFeedPostBlocked,
		AppStickerTarget,
		AppStickerReactions,
		AppScrollScroller,
		AppFiresidePostEmbed,
		AppMediaItemBackdrop,
		AppBackground,
		AppPostCard,
	},
	directives: {
		AppObserveDimensions: vAppObserveDimensions,
	},
})
export default class AppActivityFeedPost extends Vue {
	@Prop({ type: Object, required: true })
	item!: ActivityFeedItem;

	commonStore = setup(() => useCommonStore());

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	@Inject({ from: ActivityFeedInterfaceKey })
	feedInterface!: ActivityFeedInterface;

	stickerTargetController?: StickerTargetController;

	get app() {
		return this.commonStore;
	}

	canToggleLead = false;
	hasBypassedBlock = false;

	private queryParams: Record<string, string> = {};

	readonly Screen = Screen;
	readonly EventItem = EventItem;

	declare $el: HTMLDivElement;

	declare $refs: {
		'sticker-scroll': HTMLDivElement;
	};

	@Emit('resize') emitResize(_height: number) {}
	@Emit('clicked') emitClicked() {}

	get isNew() {
		return this.feed.isItemUnread(this.item);
	}

	get isThreadView() {
		return !Screen.isXs;
	}

	get eventItem() {
		return this.item.feedItem as EventItem;
	}

	get post() {
		return this.eventItem.action as FiresidePost;
	}

	get user() {
		return this.post.displayUser;
	}

	get game() {
		return this.post.game;
	}

	get isLeadOpen() {
		return this.feed.isItemLeadOpen(this.item);
	}

	get gameUrl() {
		return this.game?.getUrl();
	}

	get communities() {
		const communities = this.post.communities || [];

		// Yoink the feed's main community to show first.
		const idx = communities.findIndex(fpc => fpc.community.id === this.feed.mainCommunity?.id);
		if (idx === -1) {
			return communities;
		}

		communities.unshift(...communities.splice(idx, 1));
		return communities;
	}

	get link() {
		const location = this.post.routeLocation;

		return {
			...location,
			query: Object.assign({}, location.query ?? {}, this.queryParams),
		} as RouteLocationDefinition;
	}

	get linkResolved() {
		return this.$router.resolve(this.link).href;
	}

	get shouldShowFollow() {
		// Don't show follow for game posts. Only for user posts.
		if (!this.feed.shouldShowFollow || this.post.game) {
			return false;
		}

		if (this.isBlocked || this.post.user.blocked_you) {
			return false;
		}

		// Don't show follow if already following.
		if (!this.user || this.user.is_following) {
			return false;
		}

		return true;
	}

	get shouldShowManage() {
		return this.post.isManageableByUser(this.app.user);
	}

	get shouldShowCommunities() {
		return this.communities.length > 0;
	}

	get shouldShowIsPinned() {
		if (!this.post.is_pinned) {
			return false;
		}

		return this.post.getPinContextFor(this.$route) !== null;
	}

	get shouldShowDate() {
		// We always show in SSR because this is how crawlers find the link to
		// click into the post.
		return import.meta.env.SSR || this.feed.shouldShowDates;
	}

	get isBlocked() {
		return feedShouldBlockPost(this.post, this.$route);
	}

	get shouldBlock() {
		return !this.hasBypassedBlock && this.isBlocked;
	}

	get canPlaceSticker() {
		return canPlaceStickerOnFiresidePost(this.post);
	}

	get displayRules() {
		// For feeds we want to truncate links, the full links can be seen:
		// - on the post apge
		// - when hovering (html title) or on navigation
		return new ContentRules({ truncateLinks: true });
	}

	get overlay() {
		return !!this.post.background?.media_item;
	}

	created() {
		if (this.post) {
			this.stickerTargetController = createStickerTargetController(this.post);
		}

		provideStickerTargerController(this.stickerTargetController);
	}

	onResize() {
		this.emitResize(this.$el.offsetHeight);
	}

	onQueryParam(params: Record<string, string>) {
		this.queryParams = Object.assign({}, this.queryParams, params);
	}

	/**
	 * Called when clicking on the item, before running through any other click events--in the
	 * capture phase.
	 */
	onClickCapture() {
		this.emitClicked();
	}

	/**
	 * Called when bubbling back up the click for the item. Any links within the item can cancel
	 * this.
	 */
	onClick(e: MouseEvent) {
		const ignoreList = ['a', 'button'];

		// This mess is because we have to search the parent chain to see if one of the elements is
		// in our ignored list.
		let target = e.target as HTMLElement;
		if (target instanceof HTMLElement) {
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const nodeName = target.nodeName.toLowerCase();

				// Immediately stop if we hit the end.
				if ((target as any) === document || !target.parentNode) {
					break;
				}

				// If it's in our list of ignored elements, then just stop.
				if (ignoreList.indexOf(nodeName) !== -1) {
					return;
				}

				target = target.parentNode as HTMLAnchorElement;
			}
		}

		if (e.metaKey || e.altKey) {
			return;
		}

		trackPostOpen({ source: 'feed' });
		if (e.ctrlKey || e.shiftKey) {
			Navigate.newWindow(Environment.wttfBaseUrl + this.linkResolved);
			return;
		}

		this.$router.push(this.link);
	}

	onUnhideBlock() {
		this.hasBypassedBlock = true;
	}

	toggleLead() {
		this.feed.toggleItemLeadOpen(this.item);
	}

	canToggleLeadChanged(canToggle: boolean) {
		this.canToggleLead = canToggle;
	}

	scrollToStickers() {
		// Only scroll up if they've expanded the item.
		if (this.feed.isItemOpen(this.item)) {
			Scroll.to(this.$refs['sticker-scroll'], { preventDirections: ['down'] });
		}
	}

	onPostEdited(item: EventItem) {
		this.feedInterface.onPostEdited(item);
	}

	onPostPublished(item: EventItem) {
		this.feedInterface.onPostPublished(item);
	}

	onPostRemoved(item: EventItem) {
		this.feedInterface.onPostRemoved(item);
	}

	onPostFeatured(item: EventItem, community: Community) {
		this.feedInterface.onPostFeatured(item, community);
	}

	onPostUnfeatured(item: EventItem, community: Community) {
		this.feedInterface.onPostUnfeatured(item, community);
	}

	onPostMovedChannel(item: EventItem, movedTo: CommunityChannel) {
		this.feedInterface.onPostMovedChannel(item, movedTo);
	}

	onPostRejected(item: EventItem, community: Community) {
		this.feedInterface.onPostRejected(item, community);
	}

	onPostPinned(item: EventItem) {
		this.feedInterface.onPostPinned(item);
	}

	onPostUnpinned(item: EventItem) {
		this.feedInterface.onPostUnpinned(item);
	}

	getChannelRoute(postCommunity: FiresidePostCommunity) {
		if (!postCommunity.channel) {
			return undefined;
		}

		return postCommunity.community.channelRouteLocation(postCommunity.channel);
	}

	getChannelTitle(postCommunity: FiresidePostCommunity) {
		return postCommunity.channel?.title ?? '';
	}
}
</script>

<template>
	<div v-app-observe-dimensions="onResize" class="-container">
		<AppActivityFeedPostBlocked
			v-if="shouldBlock"
			:username="user.username"
			@show="onUnhideBlock"
		/>
		<div
			v-else
			class="-item"
			:class="{
				'-new': isNew,
			}"
			@click.capture="onClickCapture"
			@click="onClick"
		>
			<AppBackground :background="post.background" :darken="overlay" bleed>
				<div v-if="user" class="-header">
					<div class="-header-content">
						<AppUserCardHover :user="user" :disabled="!feed.shouldShowUserCards">
							<div class="-header-avatar">
								<div class="-header-avatar-inner">
									<AppUserAvatar :user="user" />
								</div>
							</div>
						</AppUserCardHover>

						<div class="-header-byline">
							<div class="-header-byline-name">
								<strong>
									<router-link
										class="link-unstyled"
										:class="{ '-overlay-text': overlay }"
										:to="{
											name: 'profile.overview',
											params: { username: user.username },
										}"
									>
										{{ user.display_name }}
										<AppUserVerifiedTick :user="user" />
									</router-link>
								</strong>

								<small class="text-muted" :class="{ '-overlay-text': overlay }">
									<router-link
										class="link-unstyled"
										:to="{
											name: 'profile.overview',
											params: { username: user.username },
										}"
									>
										@{{ user.username }}
									</router-link>
								</small>
							</div>

							<div v-if="game && !feed.hideGameInfo" class="-header-byline-game">
								<strong class="text-muted" :class="{ '-overlay-text': overlay }">
									<router-link :to="gameUrl" class="link-unstyled">
										{{ game.title }}
									</router-link>
								</strong>
							</div>
						</div>
					</div>
					<div
						class="-header-meta small text-muted"
						:class="{ '-overlay-text': overlay }"
					>
						<AppUserFollowWidget
							v-if="shouldShowFollow"
							class="-header-meta-follow"
							:user="user"
							:sm="Screen.isXs"
							hide-count
							location="feed"
						/>

						<span>
							<span v-if="shouldShowIsPinned" class="tag">
								<AppJolticon icon="thumbtack" />
								<AppTranslate>Pinned</AppTranslate>
							</span>
							{{ ' ' }}
							<AppActivityFeedPostTime
								v-if="shouldShowDate"
								:post="post"
								:link="linkResolved"
							/>
						</span>
					</div>
				</div>

				<AppActivityFeedPostVideo
					v-if="post.hasVideo"
					:item="item"
					:post="post"
					@query-param="onQueryParam"
				/>

				<AppActivityFeedPostMedia
					v-if="post.hasMedia"
					:item="item"
					:post="post"
					:can-place-sticker="canPlaceSticker"
				/>

				<div ref="sticker-scroll" />

				<div :class="{ '-overlay-post-lead': overlay }">
					<AppStickerTarget
						:controller="stickerTargetController"
						:disabled="!canPlaceSticker"
					>
						<!--
					This shouldn't ever really show a collapser. It's for the jokers that think it would
					be fun to make a post with a bunch of new lines.
					-->
						<AppFadeCollapse
							:collapse-height="400"
							:is-open="isLeadOpen"
							:animate="false"
							@require-change="canToggleLeadChanged"
						>
							<AppContentViewer
								class="fireside-post-lead"
								:source="post.lead_content"
								:display-rules="displayRules"
							/>
						</AppFadeCollapse>
					</AppStickerTarget>

					<a v-if="canToggleLead" class="hidden-text-expander" @click="toggleLead()" />

					<AppStickerControlsOverlay>
						<AppFiresidePostEmbed
							v-for="embed of post.embeds"
							:key="embed.id"
							:embed="embed"
						/>

						<AppActivityFeedPostText
							v-if="post.has_article"
							:item="item"
							:post="post"
						/>

						<div v-if="post.hasPoll" class="-poll" @click.stop>
							<AppPollVoting :poll="post.poll" :game="post.game" :user="post.user" />
						</div>
					</AppStickerControlsOverlay>
				</div>

				<!-- TODO(backgrounds) -->
				<AppStickerControlsOverlay :hide="!!post.background">
					<div
						v-if="post.sticker_counts.length"
						class="-reactions-container -controls-buffer"
						@click.stop
					>
						<AppStickerReactions
							:controller="stickerTargetController"
							@show="scrollToStickers()"
						/>
					</div>

					<!-- TODO(backgrounds) -->
					<AppScrollScroller
						v-if="shouldShowCommunities"
						class="-communities -controls-buffer"
						horizontal
					>
						<AppCommunityPill
							v-for="postCommunity of communities"
							:key="postCommunity.id"
							:community-link="postCommunity"
						/>
					</AppScrollScroller>
				</AppStickerControlsOverlay>

				<AppPostControls
					class="-controls"
					:post="post"
					:feed="feed"
					:item="item"
					:overlay="overlay"
					show-comments
					location="feed"
					event-label="feed"
					@post-edit="onPostEdited(eventItem)"
					@post-publish="onPostPublished(eventItem)"
					@post-remove="onPostRemoved(eventItem)"
					@post-feature="onPostFeatured(eventItem, $event)"
					@post-unfeature="onPostUnfeatured(eventItem, $event)"
					@post-move-channel="onPostMovedChannel(eventItem, $event)"
					@post-reject="onPostRejected(eventItem, $event)"
					@post-pin="onPostPinned(eventItem)"
					@post-unpin="onPostUnpinned(eventItem)"
					@sticker="scrollToStickers()"
				/>
			</AppBackground>
		</div>
	</div>
</template>

<style lang="stylus" src="./post.styl" scoped></style>
<style lang="stylus" scoped>
.-container
	--overlay-lead-padding: ($grid-gutter-width-xs / 2)

	@media $media-md-up
		--overlay-lead-padding: ($grid-gutter-width / 2)

.-overlay-text
	color: white
	text-shadow: black 1px 1px 4px

.-overlay-box > *
	elevate-1()
	// box-shadow: black 1px 1px 4px



.-overlay-post-lead
	rounded-corners-lg()
	change-bg('bg')
	elevate-1()
	overflow: hidden
	padding: 0 var(--overlay-lead-padding)
	margin: var(--overlay-lead-padding) 0
</style>
