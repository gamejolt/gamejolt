<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouteLocationDefinition } from '../../../../../utils/router';
import { trackPostOpen } from '../../../../../_common/analytics/analytics.service';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityPill from '../../../../../_common/community/pill/pill.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import AppStickerControlsOverlay from '../../../../../_common/sticker/AppStickerControlsOverlay.vue';
import AppStickerPlacementList from '../../../../../_common/sticker/AppStickerPlacementList.vue';
import AppStickerLayer from '../../../../../_common/sticker/layer/AppStickerLayer.vue';
import { canPlaceStickerOnFiresidePost } from '../../../../../_common/sticker/placement/placement.model';
import {
	createStickerTargetController,
	provideStickerTargerController,
} from '../../../../../_common/sticker/target/target-controller';
import AppFiresidePostEmbed from '../../../fireside/post/embed/embed.vue';
import AppPollVoting from '../../../poll/voting/voting.vue';
import AppPostContent from '../../../post/AppPostContent.vue';
import AppPostHeader from '../../../post/AppPostHeader.vue';
import AppPostControls from '../../../post/controls/AppPostControls.vue';
import { useActivityFeedInterface } from '../AppActivityFeed.vue';
import { feedShouldBlockPost } from '../feed-service';
import { ActivityFeedItem } from '../item-service';
import { useActivityFeed } from '../view';
import AppActivityFeedPostBlocked from './blocked/blocked.vue';
import AppActivityFeedPostMedia from './media/media.vue';
import AppActivityFeedPostText from './text/text.vue';
import AppActivityFeedPostVideo from './video/video.vue';

const props = defineProps({
	item: {
		type: Object as PropType<ActivityFeedItem>,
		required: true,
	},
});

const { item } = toRefs(props);

const emit = defineEmits({
	resize: (_height: number) => true,
	clicked: () => true,
});

const feed = useActivityFeed()!;
const feedInterface = useActivityFeedInterface()!;
const route = useRoute();
const router = useRouter();

const eventItem = computed(() => item.value.feedItem as EventItem);
const post = computed(() => eventItem.value.action as FiresidePost);

const stickerTargetController = createStickerTargetController(post.value, {
	isCreator: computed(() => user.value.is_creator === true),
});

provideStickerTargerController(stickerTargetController);

const hasBypassedBlock = ref(false);

const queryParams = ref<Record<string, string>>();

const root = ref<HTMLDivElement>();
const stickerScroll = ref<HTMLDivElement>();

const isNew = computed(() => feed.isItemUnread(item.value));

const user = computed(() => post.value.displayUser);

const communities = computed(() => {
	const communities = post.value.communities || [];

	// Yoink the feed's main community to show first.
	const idx = communities.findIndex(fpc => fpc.community.id === feed.mainCommunity?.id);
	if (idx === -1) {
		return communities;
	}

	communities.unshift(...communities.splice(idx, 1));
	return communities;
});

const link = computed(() => {
	const location = post.value.routeLocation;

	return {
		...location,
		query: Object.assign({}, location.query ?? {}, queryParams.value),
	} as RouteLocationDefinition;
});

const linkResolved = computed(() => router.resolve(link.value).href);

const shouldShowCommunities = computed(() => communities.value.length > 0);

const shouldShowIsPinned = computed(() => {
	if (!post.value.is_pinned) {
		return false;
	}

	return post.value.getPinContextFor(route) !== null;
});

const shouldShowDate = computed(() => {
	// We always show in SSR because this is how crawlers find the link to
	// click into the post.
	return import.meta.env.SSR || feed.shouldShowDates;
});

const isBlocked = computed(() => {
	return feedShouldBlockPost(post.value, route);
});

const shouldBlock = computed(() => {
	return !hasBypassedBlock.value && isBlocked.value;
});

const canPlaceSticker = computed(() => {
	return canPlaceStickerOnFiresidePost(post.value);
});

const overlay = computed(() => {
	return !!post.value.background?.media_item;
});

function onResize() {
	emit('resize', root.value!.offsetHeight);
}

function onQueryParam(params: Record<string, string>) {
	queryParams.value = Object.assign({}, queryParams.value, params);
}

/**
 * Called when clicking on the item, before running through any other click events--in the
 * capture phase.
 */
function onClickCapture() {
	emit('clicked');
}

/**
 * Called when bubbling back up the click for the item. Any links within the
 * item can cancel this.
 *
 */
function onClick(e: MouseEvent) {
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
	if (!GJ_IS_DESKTOP_APP && (e.ctrlKey || e.shiftKey)) {
		Navigate.newWindow(Environment.wttfBaseUrl + linkResolved.value);
		return;
	}

	router.push(link.value);
}

function onUnhideBlock() {
	hasBypassedBlock.value = true;
}

function scrollToStickers() {
	// Only scroll up if they've expanded the item.
	if (stickerScroll.value && feed.isItemOpen(item.value)) {
		Scroll.to(stickerScroll.value, { preventDirections: ['down'] });
	}
}

function onPostEdited(item: EventItem) {
	feedInterface.onPostEdited(item);
}

function onPostPublished(item: EventItem) {
	feedInterface.onPostPublished(item);
}

function onPostRemoved(item: EventItem) {
	feedInterface.onPostRemoved(item);
}

function onPostFeatured(item: EventItem, community: Community) {
	feedInterface.onPostFeatured(item, community);
}

function onPostUnfeatured(item: EventItem, community: Community) {
	feedInterface.onPostUnfeatured(item, community);
}

function onPostMovedChannel(item: EventItem, movedTo: CommunityChannel) {
	feedInterface.onPostMovedChannel(item, movedTo);
}

function onPostRejected(item: EventItem, community: Community) {
	feedInterface.onPostRejected(item, community);
}

function onPostPinned(item: EventItem) {
	feedInterface.onPostPinned(item);
}

function onPostUnpinned(item: EventItem) {
	feedInterface.onPostUnpinned(item);
}
</script>

<template>
	<div ref="root" v-app-observe-dimensions="onResize" class="-container">
		<AppStickerLayer no-mask>
			<AppActivityFeedPostBlocked
				v-if="shouldBlock"
				:username="user.username"
				@show="onUnhideBlock"
			/>
			<div v-else class="-item" @click.capture="onClickCapture" @click="onClick">
				<AppBackground :background="post.background" :darken="overlay" bleed>
					<AppPostHeader
						:post="post"
						follow-location="feed"
						:feed="feed"
						:show-pinned="shouldShowIsPinned"
						:show-date="shouldShowDate"
						:date-link="linkResolved"
						:is-new="isNew"
					/>

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

					<div ref="stickerScroll" />
					<AppPostContent
						:post="post"
						:sticker-target-controller="stickerTargetController"
						truncate-links
					>
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
								<AppPollVoting
									:poll="post.poll"
									:game="post.game"
									:user="post.user"
								/>
							</div>
						</AppStickerControlsOverlay>
					</AppPostContent>

					<AppStickerControlsOverlay :hide="!!post.background">
						<AppStickerPlacementList
							:sticker-target-controller="stickerTargetController"
							:supporters="post.supporters"
							:stickers="post.sticker_counts"
							@show="scrollToStickers"
						/>

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
		</AppStickerLayer>
	</div>
</template>

<style lang="stylus" src="./post.styl" scoped></style>
