<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppProgressBar from '../../../../../_common/progress/AppProgressBar.vue';
import AppProgressPoller from '../../../../../_common/progress/poller/AppProgressPoller.vue';

@Options({
	components: {
		AppProgressPoller,
		AppProgressBar,
	},
})
export default class AppPostControlsSaveProgress extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePostModel;

	// Before the first bit of progress arrives, show a full indeterminate bar.
	progress = 1;
	isIndeterminate = true;

	onProgress({ post }: any, progress: number, isIndeterminate: boolean) {
		this.progress = progress;
		this.isIndeterminate = isIndeterminate;
		this.assignPost(post);
	}

	onComplete({ post }: any) {
		this.assignPost(post);
	}

	private assignPost(postData: any) {
		if (postData) {
			const post = new FiresidePostModel(postData);
			this.post.assign(post);
		}
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
