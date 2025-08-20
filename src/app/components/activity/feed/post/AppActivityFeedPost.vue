<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { trackPostOpen } from '../../../../../_common/analytics/analytics.service';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { isDynamicGoogleBot } from '../../../../../_common/device/device.service';
import { Environment } from '../../../../../_common/environment/environment.service';
import { EventItemModel } from '../../../../../_common/event-item/event-item.model';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { Navigate } from '../../../../../_common/navigate/navigate.service';
import { vAppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import AppStickerControlsOverlay from '../../../../../_common/sticker/AppStickerControlsOverlay.vue';
import AppStickerPlacementList from '../../../../../_common/sticker/AppStickerPlacementList.vue';
import AppStickerLayer from '../../../../../_common/sticker/layer/AppStickerLayer.vue';
import {
	createStickerTargetController,
	provideStickerTargetController,
} from '../../../../../_common/sticker/target/target-controller';
import { kThemeGjOverlayNotice } from '../../../../../_common/theme/variables';
import { styleTyped } from '../../../../../_styles/mixins';
import { RouteLocationDefinition } from '../../../../../utils/router';
import AppContentTargets from '../../../content/AppContentTargets.vue';
import AppFiresidePostEmbed from '../../../fireside/post/embed/AppFiresidePostEmbed.vue';
import AppPollVoting from '../../../poll/AppPollVoting.vue';
import AppPostContent from '../../../post/AppPostContent.vue';
import AppPostHeader from '../../../post/AppPostHeader.vue';
import AppPostControls from '../../../post/controls/AppPostControls.vue';
import {
	kPostItemPaddingVertical,
	kPostItemPaddingXsVertical,
	PostFeedItemContainerStyles,
} from '../../../post/post-styles';
import { useActivityFeedInterface } from '../AppActivityFeed.vue';
import { feedShouldBlockPost } from '../feed-service';
import { ActivityFeedItem } from '../item-service';
import { useActivityFeed } from '../view';
import AppActivityFeedPostArticle from './AppActivityFeedPostArticle.vue';
import AppActivityFeedPostBlocked from './AppActivityFeedPostBlocked.vue';
import AppActivityFeedPostMedia from './AppActivityFeedPostMedia.vue';
import AppActivityFeedPostVideo from './AppActivityFeedPostVideo.vue';
import AppActivityFeedPostWrapper from './AppActivityFeedPostWrapper.vue';

type Props = {
	item: ActivityFeedItem;
};

const { item } = defineProps<Props>();

const emit = defineEmits({
	resize: (_height: number) => true,
	clicked: () => true,
});

const feed = useActivityFeed()!;
const feedInterface = useActivityFeedInterface()!;
const route = useRoute();
const router = useRouter();

const eventItem = computed(() => item.feedItem as EventItemModel);
const post = computed(() => eventItem.value.action as FiresidePostModel);

const stickerTargetController = createStickerTargetController(post.value, {
	canReceiveCharge: () => post.value.can_receive_charged_stickers,
});

provideStickerTargetController(stickerTargetController);

const hasBypassedBlock = ref(false);

const queryParams = ref<Record<string, string>>();

const root = ref<HTMLDivElement>();
const stickerScroll = ref<HTMLDivElement>();

const user = toRef(() => post.value.displayUser);

const isNew = computed(() => feed.isItemUnread(item));

const communities = computed(() => {
	const result = [...post.value.communities];

	// Yoink the feed's main community to show first.
	const idx = result.findIndex(fpc => fpc.community.id === feed.mainCommunity?.id);
	if (idx === -1) {
		return result;
	}

	result.unshift(...result.splice(idx, 1));
	return result;
});

const realms = computed(() => post.value.realms.map(i => i.realm));

const link = computed(() => {
	const location = post.value.routeLocation;

	return {
		...location,
		query: Object.assign({}, location.query ?? {}, queryParams.value),
	} as RouteLocationDefinition;
});

const linkResolved = computed(() => router.resolve(link.value).href);

const shouldShowIsPinned = computed(() => {
	if (!post.value.is_pinned) {
		return false;
	}

	return post.value.getPinContextFor(route) !== null;
});

const isBlocked = computed(() => feedShouldBlockPost(post.value, route));
const shouldBlock = computed(() => !hasBypassedBlock.value && isBlocked.value);

const overlay = computed(() => !!post.value.background?.media_item);

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
	if (stickerScroll.value && feed.isItemOpen(item)) {
		Scroll.to(stickerScroll.value, { preventDirections: ['down'] });
	}
}

function onPostEdited(item: EventItemModel) {
	feedInterface.onPostEdited(item);
}

function onPostPublished(item: EventItemModel) {
	feedInterface.onPostPublished(item);
}

function onPostRemoved(item: EventItemModel) {
	feedInterface.onPostRemoved(item);
}

function onPostFeatured(item: EventItemModel, community: CommunityModel) {
	feedInterface.onPostFeatured(item, community);
}

function onPostUnfeatured(item: EventItemModel, community: CommunityModel) {
	feedInterface.onPostUnfeatured(item, community);
}

function onPostMovedChannel(item: EventItemModel, movedTo: CommunityChannelModel) {
	feedInterface.onPostMovedChannel(item, movedTo);
}

function onPostRejected(item: EventItemModel, community: CommunityModel) {
	feedInterface.onPostRejected(item, community);
}

function onPostPinned(item: EventItemModel) {
	feedInterface.onPostPinned(item);
}

function onPostUnpinned(item: EventItemModel) {
	feedInterface.onPostUnpinned(item);
}

const vPadding = computed(() =>
	Screen.isXs ? kPostItemPaddingXsVertical.px : kPostItemPaddingVertical.px
);
</script>

<template>
	<div ref="root" v-app-observe-dimensions="onResize" :style="PostFeedItemContainerStyles">
		<AppStickerLayer no-mask>
			<AppActivityFeedPostBlocked
				v-if="shouldBlock"
				:username="user.username"
				@show="onUnhideBlock"
			/>
			<AppActivityFeedPostWrapper v-else @click.capture="onClickCapture" @click="onClick">
				<div
					v-if="isNew"
					:style="{
						position: `absolute`,
						top: `6px`,
						left: `6px`,
						width: `12px`,
						height: `12px`,
						borderRadius: `50%`,
						zIndex: 2,
						backgroundColor: kThemeGjOverlayNotice,
						filter: `drop-shadow(0 0 1px ${kThemeGjOverlayNotice})`,
					}"
				/>

				<AppBackground
					:background="post.background"
					:darken="overlay"
					:fade-opacity="post.hasAnyMedia ? 0.2 : undefined"
					bleed
				>
					<AppPostHeader
						:post
						:feed
						follow-location="feed"
						:show-pinned="shouldShowIsPinned"
						:date-link="linkResolved"
					/>

					<AppActivityFeedPostVideo
						v-if="post.hasVideo"
						:item
						:post
						@query-param="onQueryParam"
					/>

					<AppActivityFeedPostMedia
						v-if="post.hasMedia"
						:item
						:post
						:can-place-sticker="post.canPlaceSticker"
					/>

					<div ref="stickerScroll" />
					<AppPostContent :post :sticker-target-controller truncate-links>
						<AppStickerControlsOverlay>
							<AppFiresidePostEmbed
								v-for="embed of post.embeds"
								:key="embed.id"
								:embed
							/>

							<AppActivityFeedPostArticle v-if="post.has_article" :item :post />

							<div
								v-if="post.hasPoll"
								:style="{
									marginBottom: vPadding,
								}"
								@click.stop
							>
								<AppPollVoting :post :poll="post.poll!" />
							</div>
						</AppStickerControlsOverlay>
					</AppPostContent>

					<AppStickerControlsOverlay :hide="!!post.background">
						<AppStickerPlacementList
							v-if="!isDynamicGoogleBot()"
							:sticker-target-controller
							:supporters="post.supporters"
							:stickers="post.sticker_counts"
							@show="scrollToStickers"
						/>

						<AppContentTargets
							v-if="communities.length || realms.length"
							:style="
								styleTyped({
									whiteSpace: `nowrap`,
									marginBottom: vPadding,
								})
							"
							:communities
							:realms
							has-links
						/>
					</AppStickerControlsOverlay>

					<AppPostControls
						class="-controls"
						:post
						:feed
						:item
						:overlay
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
			</AppActivityFeedPostWrapper>
		</AppStickerLayer>
	</div>
</template>
