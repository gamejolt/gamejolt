<script lang="ts" setup>
import { computed, PropType, useSlots } from 'vue';
import { IllustrationAsset } from '../../app/img/ill/illustrations';

defineProps({
	asset: {
		type: Object as PropType<IllustrationAsset>,
		required: true,
	},
	sm: {
		type: Boolean,
	},
	maxWidth: {
		type: Number,
		default: 0,
	},
});

const slots = useSlots();

const hasContent = computed(() => !!slots.default);
</script>

<template>
	<div class="-container">
		<img
			class="-ill"
			:width="asset.width / 2"
			:height="asset.height / 2"
			:style="
				maxWidth
					? {
							maxWidth: `${maxWidth}px`,
							height: 'auto',
					  }
					: undefined
			"
			:src="asset.path"
		/>

		<div v-if="hasContent" class="-text" :class="{ '-sm': sm }">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-font-size-xs = 15px
$-font-size = 19px

.-container
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center
	text-align: center

.-ill
	margin: 24px 0
	max-width: 100%

.-text
	color: var(--theme-fg-muted)
	font-size: $-font-size-xs
	max-width: 500px

	@media $media-sm-up
		&:not(.-sm)
			font-size: $-font-size
</style>
