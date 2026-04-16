<script lang="ts" setup>
import { computed, ref } from 'vue';

import { ComponentProps } from '../../../../component-helpers';
import AppScrollInview, { ScrollInviewConfig } from '../../../../scroll/inview/AppScrollInview.vue';
import { EmojiModel } from '../../../emoji.model';

type Props = {
	emoji: EmojiModel;
	/**
	 * If provided, the emoji will only be rendered when it is inview.
	 */
	inviewConfig?: ScrollInviewConfig;
};
const { emoji, inviewConfig } = defineProps<Props>();

const emit = defineEmits<{
	select: [emoji: EmojiModel];
}>();

const isHydrated = ref(import.meta.env.SSR);

const rootComponentProps = computed(() => {
	if (!inviewConfig) {
		return {};
	}

	return {
		config: inviewConfig,
		onInview,
		onOutview,
	} as ComponentProps<typeof AppScrollInview>;
});

function onClickEmoji() {
	emit('select', emoji);
}

function onInview() {
	isHydrated.value = true;
}

function onOutview() {
	isHydrated.value = false;
}
</script>

<template>
	<!-- AppEmojiSelectorGroupItem -->
	<component :is="inviewConfig ? AppScrollInview : 'div'" v-bind="rootComponentProps">
		<div class="_square" @click="onClickEmoji">
			<div v-if="isHydrated || !inviewConfig" class="_square-inner">
				<img
					class="_img"
					:src="emoji.img_url"
					draggable="false"
					:title="emoji.commandString"
					alt=""
				/>
			</div>
		</div>
	</component>
</template>

<style lang="stylus" scoped>
._square
	position: relative
	width: 100%
	height: 0
	padding-top: 100%

._square-inner
	cursor: pointer
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

._img
	user-drag: none
	position: relative
	width: 100%
	max-height: 100%
	height: auto
	z-index: 1
</style>
