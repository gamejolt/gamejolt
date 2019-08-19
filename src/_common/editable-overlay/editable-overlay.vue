<template>
	<div class="editable-overlay">
		<div v-if="!disabled" class="-overlay-container" @click.capture.stop="click">
			<div class="-overlay"></div>
			<div class="-overlay-content">
				<app-jolticon icon="edit" />
				<strong>
					<slot name="overlay" />
				</strong>
			</div>
		</div>
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

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

	&, .jolticon
		cursor: pointer

.-overlay
	change-bg('darkest')
	opacity: 0.5
	z-index: 1

	.-overlay-container:hover &
		opacity: 0.8

.-overlay-content
	position: relative
	color: $white
	text-align: center
	z-index: 2

	strong
		display: block
</style>

<script lang="ts" src="./editable-overlay"></script>
