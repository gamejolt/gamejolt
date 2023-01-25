<script lang="ts" setup>
import { computed, onMounted, PropType } from 'vue';
import { trackExperimentEngagement } from '../../../../../_common/analytics/analytics.service';
import { configNextUpPostLeads } from '../../../../../_common/config/config.service';
import AppPostCardPlaceholder from '../../../../../_common/fireside/post/card/AppPostCardPlaceholder.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppPostPageRecommendationsPosts from './AppPostPageRecommendationsPosts.vue';

defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});

const shouldScroll = computed(() => Screen.isXs);

onMounted(() => {
	trackExperimentEngagement(configNextUpPostLeads);
});
</script>

<template>
	<div>
		<h4>
			<AppTranslate>Next up</AppTranslate>
		</h4>
		<component
			:is="Screen.isXs ? AppScrollScroller : 'div'"
			:class="{ '-scrollable': shouldScroll }"
			:horizontal="shouldScroll"
			:thin="shouldScroll"
		>
			<div class="-posts">
				<Suspense>
					<template #default>
						<AppPostPageRecommendationsPosts :post="post" />
					</template>

					<template #fallback>
						<template v-for="i of 4" :key="i">
							<div class="-post">
								<AppPostCardPlaceholder />
							</div>
						</template>
					</template>
				</Suspense>
			</div>
		</component>
	</div>
</template>

<style lang="stylus" scoped>
$-grid-gap = 16px

.-posts
	display: grid

	@media $media-sm
		grid-template-columns: repeat(4, 1fr)
		grid-gap: $-grid-gap

	@media $media-md-up
		grid-template-columns: 'repeat(auto-fill, minmax(calc(max(50% - %s, 110px)), 1fr))' % $-grid-gap
		grid-gap: $-grid-gap

.-scrollable
	full-bleed-xs()
	padding-left: $grid-gutter-width-xs * 0.5
	padding-right: @padding-left

	.-posts
		display: flex
		padding-bottom: 8px
		grid-gap: 0
</style>
