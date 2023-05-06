<script lang="ts" setup>
import { computed, ComputedRef, PropType, toRefs } from 'vue';
import AppJolticon, { Jolticon } from '../jolticon/AppJolticon.vue';
import { InventoryCollectible } from './collectible.model';

const props = defineProps({
	collectible: {
		type: Object as PropType<InventoryCollectible>,
		required: true,
	},
});

const { collectible } = toRefs(props);

const collectibleIcon: ComputedRef<Jolticon> = computed(() => {
	switch (collectible.value.type) {
		case 'Sticker':
			return 'sticker';
		case 'Background':
			return 'paintbrush';
		case 'Game_Trophy':
		case 'Site_Trophy':
			return 'trophy';
		case 'Avatar_Frame':
			return 'box-empty';
	}
});
</script>

<template>
	<div class="_container">
		<img
			:src="collectible.image_url"
			class="_img"
			:class="{ _locked: !collectible.is_unlocked }"
		/>
		<AppJolticon v-if="!collectible.is_unlocked" :icon="collectibleIcon" class="_icon" big />
	</div>
</template>

<style lang="stylus" scoped>
._container
	position: relative

._locked
	filter: contrast(0)

._img
	display: block
	width: 100px
	height: 100px
	rounded-corners()
	z-index: 1

._icon
	color: white
	position: absolute
	display: block
	left: 50%
	top: 50%
	margin: 0
	transform: translate(-50%, -50%);
	z-index: 2
	filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.25)) drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.25)) drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.09))
</style>
