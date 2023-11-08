<script lang="ts" setup>
import { PropType, computed, ref, toRefs } from 'vue';
import { Analytics } from '../../../../../../_common/analytics/analytics.service';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import AppContentViewer from '../../../../../../_common/content/content-viewer/AppContentViewer.vue';
import {
	FiresidePostModel,
	loadArticleIntoPost,
} from '../../../../../../_common/fireside/post/post-model';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../../_common/scroll/scroll.service';
import { ActivityFeedItem } from '../../item-service';
import { useActivityFeed } from '../../view';

const props = defineProps({
	item: {
		type: Object as PropType<ActivityFeedItem>,
		required: true,
	},
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
});

const { item, post } = toRefs(props);
const feed = useActivityFeed()!;

const isToggling = ref(false);
const isLoaded = ref(!!post.value.article_content);
const rootElem = ref<HTMLDivElement>();

const isHydrated = computed(() => {
	return feed.isItemHydrated(item.value);
});

const isLoading = computed(() => {
	return isToggling.value && !isLoaded.value;
});

const isOpen = computed(() => {
	return feed.isItemOpen(item.value);
});

async function toggleFull() {
	if (isToggling.value) {
		return;
	}

	isToggling.value = true;

	if (!isOpen.value) {
		Analytics.trackEvent('activity-feed', 'article-open');
		await expand();
	} else {
		Analytics.trackEvent('activity-feed', 'article-close');
		await collapse();
	}

	isToggling.value = false;
}

async function expand() {
	if (!isLoaded.value) {
		await loadArticleIntoPost(post.value);
		isLoaded.value = true;
	}

	feed.setItemOpen(item.value, true);
}

async function collapse() {
	if (!rootElem.value) {
		return;
	}
	// We will scroll to the bottom of the element minus some extra padding.
	// This keeps the element in view a bit.
	const elementOffset = Scroll.getElementOffsetTopFromContext(rootElem.value);
	const scrollTo = elementOffset - Screen.height * 0.25;

	// Only if we're past where we would scroll.
	if (Scroll.getScrollTop() > elementOffset) {
		Scroll.to(scrollTo, { animate: false });
	}

	feed.setItemOpen(item.value, false);
}
</script>

<template>
	<div
		ref="rootElem"
		class="post-text"
		:class="{
			'-hydrated': isHydrated,
		}"
	>
		<template v-if="isOpen">
			<div class="page-cut">
				<div class="-page-cut-content-placeholder" />
			</div>

			<AppContentViewer :source="post.article_content" disable-lightbox />
		</template>

		<div class="-page-cut-bottom page-cut">
			<div class="page-cut-content">
				<AppLoading
					v-if="isLoading"
					class="-loading"
					centered
					hide-label
					stationary
					@click.stop
				/>
				<AppButton v-else trans @click.stop="toggleFull()">
					<div v-if="!isOpen">
						{{ $gettext(`Read article`) }}
					</div>
					<div v-else>
						{{ $gettext(`Less`) }}
					</div>
				</AppButton>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'

.page-cut
	@media $media-sm-up
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

.-page-cut-bottom
	margin-bottom: ($line-height-computed / 2)

.page-cut-content
	display: inline-block
	overflow: hidden

.page-cut-content
.-page-cut-content-placeholder
	height: $button-md-line-height

.-loading
	margin: 0
	padding: 0 ($grid-gutter-width-xs / 2)

.post-text
	// Hide images and widgets until we are hydrated.
	::v-deep(img)
	::v-deep(iframe)
		visibility: hidden

	&.-hydrated
		::v-deep(img)
		::v-deep(iframe)
			visibility: visible
</style>
