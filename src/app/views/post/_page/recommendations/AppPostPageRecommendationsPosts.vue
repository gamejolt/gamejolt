<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { trackPostOpen } from '../../../../../_common/analytics/analytics.service';
import { Api } from '../../../../../_common/api/api.service';
import { configNextUpPostLeads } from '../../../../../_common/config/config.service';
import { ContentRules } from '../../../../../_common/content/content-editor/content-rules';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import AppPostCard from '../../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { HistoryCache } from '../../../../../_common/history/cache/cache.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});

const { post } = toRefs(props);
const route = useRoute();

const displayRules = new ContentRules({
	truncateLinks: true,
	inlineParagraphs: true,
});

const cacheKey = `post-recommendations-${post.value.id}`;

const payload =
	HistoryCache.get(route, cacheKey) ??
	(await Api.sendRequest(`/web/posts/recommendations/${post.value.id}`, undefined, {
		detach: true,
	}));

HistoryCache.store(route, payload, cacheKey);

const posts = ref(FiresidePost.populate<FiresidePost>(payload.posts));

const usablePosts = computed(() => {
	if (Screen.isSm) {
		return posts.value.slice(0, 8);
	}

	return posts.value;
});
</script>

<template>
	<template v-for="recommendedPost of usablePosts" :key="recommendedPost.id">
		<div class="-post">
			<AppPostCard
				class="-post-card"
				:post="recommendedPost"
				with-user
				source="postRecommendation"
				:no-link="configNextUpPostLeads.value"
			/>

			<template v-if="configNextUpPostLeads.value && recommendedPost.hasAnyMedia">
				<AppContentViewer
					class="-post-lead"
					:source="recommendedPost.lead_content"
					:display-rules="displayRules"
				/>
			</template>

			<RouterLink
				v-if="configNextUpPostLeads.value"
				class="-link-mask"
				:to="recommendedPost.routeLocation"
				@click="trackPostOpen({ source: 'postRecommendation' })"
			/>
		</div>

		<AppSpacer v-if="Screen.isXs" horizontal :scale="4" />
	</template>
</template>

<style lang="stylus" scoped>
@media $media-xs
	.-post
		min-width: 40vw

.-post
	position: relative

.-post-card
	z-index: 2

.-post-lead
	margin-top: 4px
	margin-bottom: 4px
	font-size: $font-size-small
	line-clamp(3)
	z-index: 1

	&
	::v-deep(a)
		color: var(--theme-fg)

.-link-mask
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	z-index: 3
</style>
