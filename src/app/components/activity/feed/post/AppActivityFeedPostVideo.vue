<script lang="ts" setup>
import { computed, CSSProperties, ref } from 'vue';

import AppActivityFeedVideoPlayer from '~app/components/activity/feed/_video-player/AppActivityFeedVideoPlayer.vue';
import { ActivityFeedItem } from '~app/components/activity/feed/item-service';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { $viewPostVideo } from '~common/fireside/post/video/video-model';
import {
	kPostItemPaddingVertical,
	kPostItemPaddingXsVertical,
} from '~common/post/post-styles';
import { Screen } from '~common/screen/screen-service';
import AppVideoProcessingProgress from '~common/video/processing-progress/AppVideoProcessingProgress.vue';
import { kBorderWidthBase, kGridGutterWidth, kGridGutterWidthXs } from '~styles/variables';

type Props = {
	item: ActivityFeedItem;
	post: FiresidePostModel;
};
const { post } = defineProps<Props>();

const emit = defineEmits<{
	'query-param': [params: Record<string, string>];
}>();

const hasVideoProcessingError = ref(false);
const videoProcessingErrorMsg = ref('');

const video = computed(() => post.videos[0]);

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

const containerStyles = computed(() => {
	if (Screen.isXs) {
		const hMargin = `-${kGridGutterWidthXs.value / 2}px` as const;
		return {
			marginLeft: hMargin,
			marginRight: hMargin,
			marginTop: kPostItemPaddingXsVertical.px,
		} as const satisfies CSSProperties;
	} else {
		const hMargin = `${-kGridGutterWidth.value / 2 + kBorderWidthBase.value}px` as const;
		return {
			marginLeft: hMargin,
			marginRight: hMargin,
			marginTop: kPostItemPaddingVertical.px,
		} as const satisfies CSSProperties;
	}
});
</script>

<template>
	<div :style="containerStyles">
		<template v-if="!hasVideoProcessingError">
			<template v-if="!video.is_processing && video.posterMediaItem">
				<AppActivityFeedVideoPlayer
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
