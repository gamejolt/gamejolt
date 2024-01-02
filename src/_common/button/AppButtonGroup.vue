<script lang="ts" setup>
import { styleFlexCenter } from '../../_styles/mixins';

defineProps({
	row: {
		type: Boolean,
	},
});
</script>

<template>
	<div
		v-if="$slots.default"
		class="button-group"
		:style="{
			...styleFlexCenter({
				direction: row ? 'row' : 'column',
				gap: row ? '4px' : `5px`,
			}),
		}"
	>
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
// Unset any built-in margin values added from adjacent buttons.
.button-group
	::v-deep(.button + .button)
		margin: 0
</style>
