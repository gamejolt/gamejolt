<script lang="ts">
import { computed, inject, PropType, provide, reactive, ref, toRefs } from 'vue';
import { useAdsController } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { illEndOfFeed } from '../../../img/ill/illustrations';
import AppActivityFeedItem from './item/AppActivityFeedItem.vue';
import AppActivityFeedNewButton from './new-button/new-button.vue';
import { ActivityFeedInterfaceKey, ActivityFeedKey, ActivityFeedView } from './view';

const InviewConfigShowNew = new ScrollInviewConfig({ margin: `-${Scroll.offsetTop}px` });
const InviewConfigLoadMore = new ScrollInviewConfig({ margin: `${Screen.height * 1.5}px` });

export type ActivityFeedInterface = ReturnType<typeof createActivityFeedInterface>;

/**
 * This is used to set up an interface with child components to be able to let
 * us know about state changes.
 */
function createActivityFeedInterface(hooks: {
	onPostEdited: (eventItem: EventItem) => void;
	onPostPublished: (eventItem: EventItem) => void;
	onPostRemoved: (eventItem: EventItem) => void;
	onPostFeatured: (eventItem: EventItem, community: Community) => void;
	onPostUnfeatured: (eventItem: EventItem, community: Community) => void;
	onPostMovedChannel: (eventItem: EventItem, movedTo: CommunityChannel) => void;
	onPostRejected: (eventItem: EventItem, community: Community) => void;
	onPostPinned: (eventItem: EventItem) => void;
	onPostUnpinned: (eventItem: EventItem) => void;
}) {
	return reactive({ ...hooks });
}

export function useActivityFeedInterface() {
	return inject(ActivityFeedInterfaceKey, null);
}
</script>

<script lang="ts" setup>
const props = defineProps({
	feed: {
		type: Object as PropType<ActivityFeedView>,
		required: true,
	},
	showAds: {
		type: Boolean,
	},
});

const emit = defineEmits({
	'edit-post': (_eventItem: EventItem) => true,
	'publish-post': (_eventItem: EventItem) => true,
	'remove-post': (_eventItem: EventItem) => true,
	'feature-post': (_eventItem: EventItem, _community: Community) => true,
	'unfeature-post': (_eventItem: EventItem, _community: Community) => true,
	'move-channel-post': (_eventItem: EventItem, _: any) => true,
	'reject-post': (_eventItem: EventItem, _community: Community) => true,
	'load-new': () => true,
	'load-more': () => true,
});

const { feed, showAds } = toRefs(props);
const ads = useAdsController();

provide(ActivityFeedKey, feed.value);

provide(
	ActivityFeedInterfaceKey,
	createActivityFeedInterface({
		onPostEdited,
		onPostPublished,
		onPostRemoved,
		onPostFeatured: (...args) => emit('feature-post', ...args),
		onPostUnfeatured: (...args) => emit('unfeature-post', ...args),
		onPostMovedChannel: (...args) => emit('move-channel-post', ...args),
		onPostRejected: (...args) => emit('reject-post', ...args),
		onPostPinned,
		onPostUnpinned,
	})
);

const isNewButtonInview = ref(false);

/**
 * We save the scroll position every time it changes. When clicking back to
 * the same feed we can scroll to the previous position that way. We don't
 * set a default so that vue doesn't watch it.
 */
const container = ref<HTMLDivElement>();

const shouldShowLoadMore = computed(
	() => !feed.value.reachedEnd && !feed.value.isLoadingMore && feed.value.hasItems
);
const lastPostScrollId = computed(() => feed.value.state.endScrollId);
const newCount = computed(() => feed.value.newCount);
const shouldShowAds = computed(() => showAds.value && ads.shouldShow);

function onNewButtonInview() {
	isNewButtonInview.value = true;
}

function onPostEdited(eventItem: EventItem) {
	feed.value.update(eventItem);
	emit('edit-post', eventItem);
}

function onPostPublished(eventItem: EventItem) {
	feed.value.update(eventItem);
	emit('publish-post', eventItem);
}

function onPostRemoved(eventItem: EventItem) {
	feed.value.remove([eventItem]);
	emit('remove-post', eventItem);
}

function onPostPinned(eventItem: EventItem) {
	// Pin the passed in item, and unpin all others.
	for (const item of feed.value.items) {
		if (
			item.feedItem instanceof EventItem &&
			item.feedItem.type === EventItem.TYPE_POST_ADD &&
			item.feedItem.action instanceof FiresidePost
		) {
			item.feedItem.action.is_pinned = false;
		}
	}

	if (eventItem.type === EventItem.TYPE_POST_ADD && eventItem.action instanceof FiresidePost) {
		eventItem.action.is_pinned = true;
	}
}

function onPostUnpinned(eventItem: EventItem) {
	if (eventItem.type === EventItem.TYPE_POST_ADD && eventItem.action instanceof FiresidePost) {
		eventItem.action.is_pinned = false;
	}
	onPostEdited(eventItem);
}

// Auto-loading while scrolling.
function onScrollLoadMore() {
	if (!feed.value.shouldScrollLoadMore) {
		return;
	}

	loadMore();
}

function loadMoreButton() {
	feed.value.timesLoaded = 0;
	loadMore();
}

function loadMore() {
	feed.value.loadMore();
	emit('load-more');
}

async function loadNew() {
	if (!newCount.value) {
		return;
	}

	await feed.value.loadNew();
	feed.value.newCount = 0;
	emit('load-new');
	// Make sure this is after the emitter so we remove the button before resetting
	isNewButtonInview.value = false;
}

function shouldShowAd(index: number) {
	// Show an ad after this many posts at the beginning of the feed.
	const firstAd = 2;

	// Show an ad every X posts thereafter.
	const adGap = 5;

	if (!shouldShowAds.value) {
		return false;
	}

	++index;
	return index === firstAd || (index - firstAd) % adGap === 0;
}
</script>

<template>
	<!--
	We need to refresh the whole feed anytime it's cleared or massively changed.
	Basically anytime the feed state's items are replaced so that the references
	to them get picked up again.
	-->
	<div :key="feed.id" ref="container" class="activity-feed">
		<template v-if="newCount > 0 || feed.isLoadingNew">
			<AppScrollInview :config="InviewConfigShowNew" @inview="onNewButtonInview">
				<AppExpand v-if="!feed.isLoadingNew" :when="isNewButtonInview">
					<AppActivityFeedNewButton @click="loadNew()">
						<AppTranslate>Show new items</AppTranslate>
					</AppActivityFeedNewButton>
				</AppExpand>
				<AppLoading v-else class="loading-centered" />
			</AppScrollInview>
		</template>

		<!-- Need the div so that we can target the last child in the container. -->
		<div>
			<div v-for="(item, i) of feed.items" :key="item.id" class="-item">
				<AppActivityFeedItem :item="item" />

				<div
					v-if="shouldShowAd(i)"
					class="-ad-container well fill-offset full-bleed-xs text-center"
				>
					<AppAdWidget
						size="rectangle"
						placement="content"
						:meta="{ staticSize: true }"
					/>
				</div>
			</div>
		</div>

		<!--
		If they are viewing a slice of the state, then we don't want to allow loading more.
		-->
		<AppScrollInview
			v-if="!feed.slice"
			:config="InviewConfigLoadMore"
			@inview="onScrollLoadMore"
		>
			<div v-if="shouldShowLoadMore" class="page-cut">
				<AppButton
					v-app-track-event="`activity-feed:more`"
					:to="GJ_IS_SSR ? { query: { feed_last_id: lastPostScrollId } } : undefined"
					trans
					@click="loadMoreButton"
				>
					<AppTranslate>Load More</AppTranslate>
				</AppButton>
			</div>

			<AppLoading v-if="feed.isLoadingMore" class="-bottom-loading loading-centered" />

			<AppIllustration v-if="feed.reachedEnd" :asset="illEndOfFeed">
				<p>
					<AppTranslate>
						You've found a clearing at the end of this feed. Should you set up camp?
					</AppTranslate>
				</p>
				<p>
					<AppJolticon icon="arrow-right" />
					<b><AppTranslate>Yes</AppTranslate></b>
					<AppJolticon icon="arrow-left" />
					<br />
					<AppTranslate>No</AppTranslate>
				</p>
			</AppIllustration>
		</AppScrollInview>
	</div>
</template>

<style lang="stylus" scoped src="./feed.styl"></style>
