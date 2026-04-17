<script lang="ts" setup>
import { computed, ref } from 'vue';

import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppProgressBar from '~common/progress/AppProgressBar.vue';
import AppProgressPoller from '~common/progress/poller/AppProgressPoller.vue';
import AppResponsiveDimensions from '~common/responsive-dimensions/AppResponsiveDimensions.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	post: FiresidePostModel;
};
defineProps<Props>();

const hasData = ref(false);
const progress = ref(0);
const isIndeterminate = ref(false);
// One of the first things during processing is generating a poster.
// We can show that poster once it's returned as a preview for the video.
const videoPosterImgUrl = ref<null | string>(null);

const cssFilter = computed(() => {
	// When the video is "done" processing and has no detailed progress,
	// don't have any blur on the image.
	// When we have more detailed progress, we can keep a slight blur since when the video
	// finishes processing, the video player will show instead.
	const blur =
		!isIndeterminate.value && progress.value === 1 ? 0 : Math.max(1, 3 - progress.value * 4);

	return (
		`brightness(${0.7 + progress.value * 0.3}) ` +
		`grayscale(${1 - progress.value}) ` +
		`blur(${blur}px)`
	);
});

const emit = defineEmits<{
	complete: [payload: any];
	error: [err: string | Error];
}>();

function onProgress(
	{ videoPosterImgUrl: newVideoPosterImgUrl }: any,
	newProgress: number,
	newIsDeterminate: boolean
) {
	hasData.value = true;
	videoPosterImgUrl.value = newVideoPosterImgUrl;
	isIndeterminate.value = newIsDeterminate;
	progress.value = newProgress;
}

async function onError(input: any) {
	if (input instanceof Error) {
		emit('error', input);
		return;
	}

	const errorMsg =
		input.reason ||
		$gettext(`We couldn't process your video for some reason. Try again later.`);

	emit('error', errorMsg);
}

</script>

<template>
	<div>
		<AppProgressPoller
			:url="`/web/posts/manage/add-video-progress/${post.id}`"
			:interval="3000"
			@progress="onProgress"
			@complete="emit('complete', $event)"
			@error="onError"
		/>

		<AppResponsiveDimensions :ratio="16 / 9">
			<div
				v-if="hasData"
				class="change-bg-bg-offset relative flex h-full items-center justify-center overflow-hidden rounded-lg"
			>
				<template v-if="videoPosterImgUrl">
					<AppImgResponsive
						class="relative block max-w-full max-h-full"
						:src="videoPosterImgUrl"
						:style="{
							transition: `filter 0.5s ease`,
							filter: cssFilter,
						}"
					/>

					<div class="absolute inset-0 flex items-center justify-center">
						<AppJolticon
							class="text-white [filter:drop-shadow(0_0_5px_rgba(0,0,0,1))]"
							icon="video"
							big
						/>
					</div>
				</template>
				<AppJolticon
					v-else
					class="[filter:drop-shadow(0_0_5px_rgba(0,0,0,1))]"
					icon="video"
					big
				/>
			</div>
		</AppResponsiveDimensions>

		<br />
		<AppProgressBar :percent="progress" :indeterminate="isIndeterminate" thin animate active />

		<div>
			{{
				$gettext(
					`Your video is currently being processed. This could take some time depending on the size of your video.`
				)
			}}
			<template v-if="post.isActive">
				{{ $gettext(`We will publish your post once it's ready.`) }}
			</template>
		</div>
	</div>
</template>
