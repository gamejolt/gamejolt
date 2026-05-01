<script lang="ts">
import { computed, ref, unref } from 'vue';

import AppBaseContentComponent from '~common/content/components/AppBaseContentComponent.vue';
import { useContentOwnerController } from '~common/content/content-owner';
import { useContentFocusService } from '~common/content-focus/content-focus.service';
import AppResponsiveDimensions from '~common/responsive-dimensions/AppResponsiveDimensions.vue';
import { Screen } from '~common/screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';
import AppVideo from '~common/video/AppVideo.vue';
import { getVideoPlayerFromSources } from '~common/video/player/controller';

const InviewConfig = new ScrollInviewConfig({ margin: () => `${Screen.height * 0.25}px` });
</script>

<script lang="ts" setup>
type Props = {
	gifId: string;
	width: number;
	height: number;
	service: string;
	media: Record<string, any>;
	isEditing: boolean;
	isDisabled: boolean;
	onRemoved?: () => void;
	onUpdateAttrs?: (attrs: Record<string, unknown>) => void;
};
const { width, height, media, isEditing, isDisabled, onRemoved } = defineProps<Props>();

const owner = useContentOwnerController()!;
const { isWindowFocused } = useContentFocusService();
const isInview = ref(false);

const shouldPlay = computed(() => isWindowFocused.value);

const videoController = computed(() => {
	if (!media || !media.mp4.url || !media.webm.url) {
		return undefined;
	}

	const sourcesPayload = {
		mp4: media.mp4.url,
		webm: media.webm.url,
	};

	return getVideoPlayerFromSources(sourcesPayload, 'gif', media.preview);
});

const parentWidth = computed(() => unref(owner.parentBounds?.width));

const maxWidth = computed(() => {
	const maxOwnerWidth = owner.contentRules.maxMediaWidth;
	if (maxOwnerWidth !== null) {
		const sizes = [maxOwnerWidth, width];
		if (parentWidth.value) {
			sizes.push(parentWidth.value);
		}
		return Math.min(...sizes);
	}

	return width;
});

const maxHeight = computed(() => {
	const maxOwnerHeight = owner.contentRules.maxMediaHeight;
	if (maxOwnerHeight !== null) {
		return Math.min(maxOwnerHeight, height);
	}

	return height;
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
