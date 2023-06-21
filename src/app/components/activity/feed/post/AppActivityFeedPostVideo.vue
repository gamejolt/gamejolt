<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../../../_common/fireside/post/video/video-model';
import AppVideoProcessingProgress from '../../../../../_common/video/processing-progress/AppVideoProcessingProgress.vue';
import AppActivityFeedVideoPlayer from '../_video-player/AppActivityFeedVideoPlayer.vue';
import { ActivityFeedItem } from '../item-service';

const props = defineProps({
	item: {
		type: Object as PropType<ActivityFeedItem>,
		required: true,
	},
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});

const { item, post } = toRefs(props);

const emit = defineEmits({
	'query-param': (_params: Record<string, string>) => true,
});

const hasVideoProcessingError = ref(false);
const videoProcessingErrorMsg = ref('');

const video = computed(() => post.value.videos[0]);

function onTimeChange(time: number) {
	emit('query-param', { t: `${time}` });
}

function onVideoPlay() {
	$viewPostVideo(video.value);
}

function onVideoProcessingComplete(payload: any) {
	if (payload.video && video.value) {
		video.value.assign(payload.video);
	}
}

function onVideoProcessingError(err: string | Error) {
	if (typeof err === 'string') {
		hasVideoProcessingError.value = true;
		videoProcessingErrorMsg.value = err;
	} else {
		// The only cases where an actual error is emitted is on network error
		// during polling. This does not necessarily mean an actual error during
		// processing, so noop.
	}
}
</script>

<template>
	<div class="-spacing">
		<template v-if="!hasVideoProcessingError">
			<template v-if="!video.is_processing && video.posterMediaItem">
				<AppActivityFeedVideoPlayer
					:feed-item="item"
					:manifests="video.manifestSources"
					:media-item="video.posterMediaItem"
					@play="onVideoPlay"
					@time="onTimeChange"
				/>
			</template>
			<div v-else class="well sans-rounded fill-offset">
				<AppVideoProcessingProgress
					:post="post"
					@complete="onVideoProcessingComplete"
					@error="onVideoProcessingError"
				/>
			</div>
		</template>
		<template v-else>
			<div class="well">
				<div class="alert alert-notice">{{ videoProcessingErrorMsg }}</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.-spacing
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: @margin-left
	margin-top: $-item-padding-xs-v

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2) + $border-width-base
		margin-right: @margin-left
		margin-top: $-item-padding-v
</style>
