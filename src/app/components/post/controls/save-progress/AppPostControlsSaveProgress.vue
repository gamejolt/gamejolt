<script lang="ts" setup>
import { ref } from 'vue';

import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppProgressBar from '~common/progress/AppProgressBar.vue';
import AppProgressPoller from '~common/progress/poller/AppProgressPoller.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	post: FiresidePostModel;
};

const { post } = defineProps<Props>();

const progress = ref(1);
const isIndeterminate = ref(true);

function onProgress({ post: postData }: any, prog: number, indeterminate: boolean) {
	progress.value = prog;
	isIndeterminate.value = indeterminate;
	assignPost(postData);
}

function onComplete({ post: postData }: any) {
	assignPost(postData);
}

function assignPost(postData: any) {
	if (postData) {
		const newPost = new FiresidePostModel(postData);
		post.assign(newPost);
	}
}
</script>

<template>
	<div>
		<div>
			<AppProgressBar
				class="-bar"
				:indeterminate="isIndeterminate"
				:percent="progress * 100"
				thin
				active
			/>
		</div>
		<template v-if="post.status === 'active'">
			<AppTranslate>
				Your post is being processed and will be published once it's ready
			</AppTranslate>
		</template>
		<template v-else>
			<AppTranslate>Parts of your post are being processed</AppTranslate>
		</template>
		<AppProgressPoller
			:url="`/web/posts/manage/save-post-progress/${post.id}`"
			:interval="2000"
			@progress="onProgress"
			@complete="onComplete"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.-bar
	margin-bottom: 4px
</style>
