<script lang="ts" setup>
import AppJolticon from '../jolticon/AppJolticon.vue';
defineProps({
	disabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	click: () => true,
});
</script>

<template>
	<div class="editable-overlay">
		<div
			v-if="!disabled"
			class="-overlay-container theme-dark"
			@click.capture.stop="emit('click')"
		>
			<div class="-overlay" />
			<div class="-overlay-content">
				<AppJolticon class="-icon" icon="edit" />
				<strong class="-label">
					<slot name="overlay" />
				</strong>
			</div>
		</div>
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.editable-overlay
	position: relative
	z-index: 1

.-overlay-container, .-overlay
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-overlay-container
	display: flex
	align-items: center
	justify-content: center
	z-index: 1000

.-icon
	font-size: $jolticon-size * 1.5

.-label
	display: block
	margin-top: 12px

.-icon
	color: var(--theme-link)

.-overlay-container, .-icon
	cursor: pointer

.-overlay
	change-bg('darkest')
	opacity: 0.7
	z-index: 1

	.-overlay-container:hover &
		opacity: 0.8

.-overlay-content
	position: relative
	color: $white
	text-align: center
	z-index: 2
</style>
