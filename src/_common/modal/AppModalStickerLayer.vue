<script lang="ts" setup>
/**
 * This component can be used in sections with modals and sticker layers. It
 * allows you to wrap the modal body in a sticker layer so everything renders
 * properly.
 */

import { PropType } from 'vue';
import AppStickerLayer from '../sticker/layer/layer.vue';
import { Modal } from './modal.service';

defineProps({
	modal: {
		type: Object as PropType<Modal>,
		required: true,
	},
});
</script>

<template>
	<AppStickerLayer class="-modal-sticker-layer" :class="{ '-full': modal.size === 'full' }">
		<slot />
	</AppStickerLayer>
</template>

<style lang="stylus" scoped>
.-modal-sticker-layer
	position: relative
	min-height: 100vh

	@media $media-sm-up
		padding: 30px 0
		padding-top: 100px

	&.-full
		padding: 0
</style>
