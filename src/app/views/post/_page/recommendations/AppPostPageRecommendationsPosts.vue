<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Api } from '~common/api/api.service';
import AppPostCard from '~common/fireside/post/card/AppPostCard.vue';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { HistoryCache } from '~common/history/cache/cache.service';
import { getScreen } from '~common/screen/screen-service';
import AppSpacer from '~common/spacer/AppSpacer.vue';

type Props = {
	post: FiresidePostModel;
};
const { post } = defineProps<Props>();
const route = useRoute();
const { isXs, isSm } = getScreen();

const cacheKey = `post-recommendations-${post.id}`;

const payload =
	HistoryCache.get(route, cacheKey) ??
	(await Api.sendRequest(`/web/posts/recommendations/${post.id}`, undefined, {
		detach: true,
	}));

HistoryCache.store(route, payload, cacheKey);

const posts = ref(FiresidePostModel.populate<FiresidePostModel>(payload.posts));

const usablePosts = computed(() => {
	if (isSm.value) {
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

		<AppSpacer v-if="isXs" horizontal :scale="4" />
	</template>
</template>

<style lang="stylus" scoped>
@media $media-xs
	.-post
		min-width: 40vw
</style>
