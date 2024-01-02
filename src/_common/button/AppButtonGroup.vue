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

// TODO(profile-scrunch) Not sure we can get this working when a button sibling
// is placed above this button group.
._button-group + ::v-deep(.button.-block)
	margin-top: 5px
</style>
