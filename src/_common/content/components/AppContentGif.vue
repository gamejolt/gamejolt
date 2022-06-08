<script lang="ts" setup>
import { computed, ref, toRefs, unref } from 'vue';
import { ContentFocus } from '../../content-focus/content-focus.service';
import AppResponsiveDimensions from '../../responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../scroll/inview/AppScrollInview.vue';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppVideo from '../../video/video.vue';
import { defineEditableNodeViewProps } from '../content-editor/node-views/base';
import { useContentOwnerController } from '../content-owner';
import AppBaseContentComponent from './AppBaseContentComponent.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.25}px` });

const props = defineProps({
	gifId: {
		type: String,
		required: true,
	},
	width: {
		type: Number,
		required: true,
	},
	height: {
		type: Number,
		required: true,
	},
	service: {
		type: String,
		required: true,
	},
	media: {
		type: Object,
		required: true,
	},
	isEditing: {
		type: Boolean,
		required: true,
	},
	isDisabled: {
		type: Boolean,
		required: true,
	},
	...defineEditableNodeViewProps(),
});

const { width, height, media, isEditing, isDisabled } = toRefs(props);

const owner = useContentOwnerController()!;
const isInview = ref(false);

const shouldPlay = computed(() => {
	return ContentFocus.isWindowFocused;
});

const videoController = computed(() => {
	if (!media.value || !media.value.mp4.url || !media.value.webm.url) {
		return undefined;
	}

	const sourcesPayload = {
		mp4: media.value.mp4.url,
		webm: media.value.webm.url,
	};

	return getVideoPlayerFromSources(sourcesPayload, 'gif', media.value.preview);
});

const parentWidth = computed(() => unref(owner.parentBounds?.width));

const maxWidth = computed(() => {
	const maxOwnerWidth = owner.contentRules.maxMediaWidth;
	if (maxOwnerWidth !== null) {
		const sizes = [maxOwnerWidth, width.value];
		if (parentWidth.value) {
			sizes.push(parentWidth.value);
		}
		return Math.min(...sizes);
	}

	return width.value;
});

const maxHeight = computed(() => {
	const maxOwnerHeight = owner.contentRules.maxMediaHeight;
	if (maxOwnerHeight !== null) {
		return Math.min(maxOwnerHeight, height.value);
	}

	return height.value;
});

function onInviewChange(inview: boolean) {
	isInview.value = inview;
}
</script>

<template>
	<AppBaseContentComponent
		:is-editing="isEditing"
		:is-disabled="isDisabled"
		@removed="onRemoved?.()"
	>
		<div class="-outer content-gif">
			<AppResponsiveDimensions
				class="-container"
				:ratio="width / height"
				:max-width="maxWidth"
				:max-height="maxHeight"
				:parent-width="parentWidth"
			>
				<AppScrollInview
					:config="InviewConfig"
					@inview="onInviewChange(true)"
					@outview="onInviewChange(false)"
				>
					<img class="-poster" :src="media.preview" />
					<AppVideo
						v-if="isInview && videoController"
						class="-video"
						:player="videoController"
						:should-play="shouldPlay"
					/>
				</AppScrollInview>
			</AppResponsiveDimensions>
		</div>
	</AppBaseContentComponent>
</template>

<style lang="stylus" scoped>
.-outer
	width: 100%
	display: flex
	flex-direction: column
	margin-bottom: $line-height-computed
	min-height: 44px // make sure the X button fits properly, usually not a problem unless the image is super wide
	align-items: center

.-container
	display: flex
	justify-content: center
	align-items: center
	rounded-corners-lg()
	overflow: hidden
	max-width: 100%
	position: relative

.-video
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	rounded-corners-lg()

.-poster
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	rounded-corners-lg()
</style>
