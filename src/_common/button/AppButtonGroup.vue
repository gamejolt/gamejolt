<script lang="ts" setup>
type Props = {
	row?: boolean;
};
defineProps<Props>();
</script>

<template>
	<div
		v-if="$slots.default"
		class="button-group flex items-center justify-center"
		:class="row ? 'flex-row gap-[4px]' : 'flex-col gap-[5px]'"
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
