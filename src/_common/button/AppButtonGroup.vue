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
		class="_button-group"
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
._button-group
	::v-deep(.button + .button)
		margin: 0

// TODO(profile-scrunch) Does order matter here, or do we need both orders?
._button-group + ::v-deep(.button.-block)
	margin-top: 5px
</style>
