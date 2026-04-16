<script lang="ts" setup>
import { computed } from 'vue';

import AppPostCardPlaceholder from '../fireside/post/card/AppPostCardPlaceholder.vue';
import { FiresidePostModel } from '../fireside/post/post-model';
import { Screen } from '../screen/screen-service';
import AppScrollScroller from '../scroll/AppScrollScroller.vue';
import AppCreatorCard, { AppCreatorCardAspectRatio } from './AppCreatorCard.vue';

type Props = {
	isLoading?: boolean;
	listType: 'scroll' | 'grid';
	posts: FiresidePostModel[];
	fancyHover?: boolean;
	gridColumnsDesktop?: number;
	gridColumnsSm?: number;
	gridColumnsXs?: number;
};
const {
	isLoading,
	listType,
	posts,
	fancyHover,
	gridColumnsDesktop = 4,
	gridColumnsSm = 3,
	gridColumnsXs = 2,
} = defineProps<Props>();

const displayPosts = computed(() => {
	if (listType !== 'grid') {
		return posts;
	}

	let count: number;
	if (Screen.isXs) {
		count = gridColumnsXs * 3;
	} else if (Screen.isSm) {
		count = gridColumnsSm * 2;
	} else {
		count = gridColumnsDesktop * 2;
	}

	return posts.slice(0, count);
});

const placeholderCount = computed(() => {
	if (listType === 'scroll') {
		return 4;
	}

	if (Screen.isXs) {
		return gridColumnsXs;
	} else if (Screen.isSm) {
		return gridColumnsSm;
	} else {
		return gridColumnsDesktop;
	}
});
</script>

<template>
	<component
		:is="listType === 'scroll' ? AppScrollScroller : 'div'"
		class="creators-list"
		:class="{
			'-scroll': listType === 'scroll',
			'-grid': listType === 'grid',
		}"
		:style="[
			`--col-desktop: ${gridColumnsDesktop}`,
			`--col-sm: ${gridColumnsSm}`,
			`--col-xs: ${gridColumnsXs}`,
		]"
		horizontal
	>
		<div
			:class="{
				'-creators-list': listType === 'scroll',
				'-creators-grid': listType === 'grid',
			}"
		>
			<slot name="left" />

			<template v-if="isLoading">
				<template v-for="_i of placeholderCount" :key="_i">
					<div class="-creator-card">
						<AppPostCardPlaceholder :aspect-ratio="AppCreatorCardAspectRatio" />
					</div>
				</template>
			</template>
			<template v-else>
				<div v-for="post of displayPosts" :key="post.id" class="-creator-card">
					<AppCreatorCard :post="post" :fancy-hover="fancyHover" />
				</div>
			</template>

			<slot name="right" />
		</div>
	</component>
</template>

<style lang="stylus" scoped>
.creators-list
	&.-scroll
		--who-width: 282px
		--who-displacement: 26px
		padding-bottom: var(--who-displacement)

		@media $media-sm
			--who-width: 216px
			--who-displacement: 20px

		@media $media-xs
			--who-width: 183px
			--who-displacement: 8px

.-creators-list
	display: flex
	gap: 24px

	@media $media-sm
		gap: 17px

	@media $media-xs
		gap: 16px

	.-creator-card
		flex: none
		width: var(--who-width)

		&:nth-child(odd)
			margin-top: var(--who-displacement)

.-creators-grid
	--col-count: var(--col-desktop)
	display: grid
	gap: 24px
	grid-template-columns: repeat(var(--col-count), minmax(0, 1fr))

	@media $media-sm
		--col-count: var(--col-sm)

	@media $media-xs
		--col-count: var(--col-xs)

	.-creator-card
		width: 100%

.-placeholder
	flex: none
</style>
