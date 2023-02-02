<script lang="ts" setup>
import { computed, CSSProperties, PropType, ref, toRefs } from 'vue';
import { styleBorderRadiusLg, styleChangeBg } from '../../../_styles/mixins';
import { FiresidePost } from '../../fireside/post/post-model';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppProgressBar from '../../progress/AppProgressBar.vue';
import AppProgressPoller from '../../progress/poller/AppProgressPoller.vue';
import AppResponsiveDimensions from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import { $gettext } from '../../translate/translate.service';

const props = defineProps({
	post: {
		type: Object as PropType<FiresidePost>,
		required: true,
	},
});

const { post } = toRefs(props);

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

const emit = defineEmits({
	complete: (_payload: any) => true,
	error: (_err: string | Error) => true,
});

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

const posterIconStyle: CSSProperties = {
	filter: `drop-shadow(0 0 5px rgba(0, 0, 0, 1))`,
};
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
				:style="{
					...styleBorderRadiusLg,
					...styleChangeBg('bg-offset'),
					overflow: `hidden`,
					position: `relative`,
					height: `100%`,
					display: `flex`,
					justifyContent: `center`,
					alignItems: `center`,
				}"
			>
				<template v-if="videoPosterImgUrl">
					<AppImgResponsive
						:src="videoPosterImgUrl"
						:style="{
							display: `block`,
							position: `relative`,
							maxWidth: `100%`,
							maxHeight: `100%`,
							transition: `filter 0.5s ease`,
							filter: cssFilter,
						}"
					/>

					<div
						:style="{
							position: `absolute`,
							left: 0,
							top: 0,
							right: 0,
							bottom: 0,
							display: `flex`,
							justifyContent: `center`,
							alignItems: `center`,
						}"
					>
						<AppJolticon
							icon="video"
							big
							:style="{
								...posterIconStyle,
								color: `white`,
							}"
						/>
					</div>
				</template>
				<AppJolticon v-else icon="video" big :style="posterIconStyle" />
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
