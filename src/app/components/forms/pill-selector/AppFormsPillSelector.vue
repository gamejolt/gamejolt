<script lang="ts" setup>
import AppPopper from '../../../../_common/popper/AppPopper.vue';

const emit = defineEmits({
	show: () => true,
	hide: () => true,
});
</script>

<template>
	<AppPopper
		class="pill-selector"
		popover-class="fill-bg"
		max-height="45vh"
		hide-on-state-change
		@show="emit('show')"
		@hide="emit('hide')"
	>
		<slot />

		<template #header>
			<slot name="header" />
		</template>

		<template #popover>
			<div class="-container">
				<slot name="popover" />
			</div>
		</template>
	</AppPopper>
</template>

<style lang="stylus" scoped>
.pill-selector
	cursor: pointer

.-container
	max-width: 300px

	@media $media-xs
		max-width: 250px
</style>
