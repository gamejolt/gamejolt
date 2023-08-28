<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import AppPostCard from '../../../../../_common/fireside/post/card/AppPostCard.vue';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { HistoryCache } from '../../../../../_common/history/cache/cache.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
});

const { post } = toRefs(props);
const route = useRoute();

const cacheKey = `post-recommendations-${post.value.id}`;

const payload =
	HistoryCache.get(route, cacheKey) ??
	(await Api.sendRequest(`/web/posts/recommendations/${post.value.id}`, undefined, {
		detach: true,
	}));

HistoryCache.store(route, payload, cacheKey);

const posts = ref(FiresidePostModel.populate<FiresidePostModel>(payload.posts));

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
				:post="recommendedPost"
				with-user
				source="postRecommendation"
				show-media-post-lead
			/>
		</div>

		<AppSpacer v-if="Screen.isXs" horizontal :scale="4" />
	</template>
</template>

<style lang="stylus" scoped>
@media $media-xs
	.-post
		min-width: 40vw
</style>
