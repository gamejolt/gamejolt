<script lang="ts" setup>
import { PropType, computed, onBeforeUnmount, ref, toRefs, watchEffect } from 'vue';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { FiresideProducer } from '../../../../../_common/fireside/rtc/producer';
import { kThemeDarkest } from '../../../../../_common/theme/variables';
import { styleBorderRadiusBase } from '../../../../../_styles/mixins';
import { kFontSizeSmall } from '../../../../../_styles/variables';

const videoElem = ref<HTMLVideoElement>();

const props = defineProps({
	producer: {
		type: Object as PropType<FiresideProducer>,
		required: true,
	},
	hidePreview: {
		type: Boolean,
	},
});

const { producer } = toRefs(props);

/**
 * This will be the preview of their local video stream that's connected to the
 * webcam/video input they chose.
 */
const videoStream = computed(() => producer.value.localVideoKit.value.localStream.value);

// Gotta watch for when it gets mounted essentially, and then set it as the
// preview element.
watchEffect(() => {
	if (videoElem.value) {
		videoElem.value.srcObject = videoStream.value;
	}
});

onBeforeUnmount(() => {
	if (videoElem.value) {
		videoElem.value.srcObject = null;
	}
});
</script>

<template>
	<AppAspectRatio
		:ratio="16 / 9"
		:style="{
			...styleBorderRadiusBase,
			position: `relative`,
			margin: `auto`,
			overflow: `hidden`,
			backgroundColor: kThemeDarkest,
		}"
	>
		<video
			v-if="!hidePreview"
			ref="videoElem"
			:style="{
				height: `100%`,
			}"
			autoplay
			muted
		/>

		<div
			:style="{
				position: `absolute`,
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				display: `flex`,
				alignItems: `center`,
				justifyContent: `center`,
				color: `white`,
				fontWeight: 700,
				fontSize: kFontSizeSmall.px,
				zIndex: 1,
				padding: `16px`,
				textAlign: `center`,
			}"
		>
			<template v-if="videoStream && hidePreview">
				<span>
					{{ $gettext(`We're hiding this video to conserve your system resources`) }}
				</span>
			</template>
			<template v-else-if="!videoStream">
				<span>
					{{ $gettext(`No video source selected`) }}
				</span>
			</template>
		</div>
	</AppAspectRatio>
</template>
