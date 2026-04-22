<script lang="ts" setup>
import { computed, CSSProperties, ref, toRef, useTemplateRef } from 'vue';

import { ActivityFeedItem } from '~app/components/activity/feed/item-service';
import { useActivityFeed } from '~app/components/activity/feed/view';
import AppButton from '~common/button/AppButton.vue';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { FiresidePostModel, loadArticleIntoPost } from '~common/fireside/post/post-model';
import AppLoading from '~common/loading/AppLoading.vue';
import { kPostItemPaddingContainer } from '~common/post/post-styles';
import { Screen } from '~common/screen/screen-service';
import { Scroll } from '~common/scroll/scroll.service';
import { styleWhen } from '~styles/mixins';

type Props = {
	item: ActivityFeedItem;
	post: FiresidePostModel;
};
const { item, post } = defineProps<Props>();

const feed = useActivityFeed()!;

const rootElem = useTemplateRef('rootElem');
const isToggling = ref(false);
const isLoaded = ref(!!post.article_content);

const isHydrated = computed(() => feed.isItemHydrated(item));
const isLoading = toRef(() => isToggling.value && !isLoaded.value);
const isOpen = computed(() => feed.isItemOpen(item));

async function toggleFull() {
	if (isToggling.value) {
		return;
	}

	isToggling.value = true;

	if (!isOpen.value) {
		await expand();
	} else {
		await collapse();
	}

	isToggling.value = false;
}

async function expand() {
	if (!isLoaded.value) {
		await loadArticleIntoPost(post);
		isLoaded.value = true;
	}

	feed.setItemOpen(item, true);
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

	feed.setItemOpen(item, false);
}

const pageCutStyles = computed(() => {
	return {
		...styleWhen(Screen.isDesktop, {
			marginLeft: `-${kPostItemPaddingContainer.px}`,
			marginRight: `-${kPostItemPaddingContainer.px}`,
		}),
	} as const satisfies CSSProperties;
});
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
			<div class="page-cut" :style="pageCutStyles">
				<div class="-page-cut-content-placeholder" />
			</div>

			<AppContentViewer :source="post.article_content" disable-lightbox />
		</template>

		<div class="-page-cut-bottom page-cut" :style="pageCutStyles">
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
					{{ !isOpen ? $gettext(`Read article`) : $gettext(`Less`) }}
				</AppButton>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
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
	:deep(img)
	:deep(iframe)
		visibility: hidden

	&.-hydrated
		:deep(img)
		:deep(iframe)
			visibility: visible
</style>
