<script lang="ts" src="./slider"></script>

<template>
	<div class="-padding">
		<div class="-mask" @mousedown="onMouseDown" />

		<div
			ref="slider"
			class="-slider"
			:class="{ '-dragging': isDragging }"
			:style="sliderStyling"
		>
			<div class="-slider-filled" :style="sliderFilledStyling" />

			<div
				ref="thumb"
				v-app-tooltip="readableSliderPercentage"
				class="-slider-thumb"
				:style="thumbStyling"
				@mousedown="onMouseDown"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-padding
	user-select: none
	position: relative
	padding: 8px
	display: flex

// Stretch out an invisible div while we're dragging to hopefully capture events properly
.-mask
	position: absolute
	top: 0
	bottom: 0
	left: 0
	right: 0
	z-index: 1
	cursor: pointer

.-slider
	border-radius: $border-radius-small
	position: relative
	margin: auto
	background-color: rgba($white, 0.5)
	box-shadow: 0 0 2px var(--theme-light)
	display: flex
	justify-content: center
	align-items: center

	&-filled
		position: absolute
		background-color: $white

.-slider-thumb
	position: absolute
	border-radius: 50%
	background-color: var(--theme-lightest)
	border: 1px solid var(--theme-lighter)
	z-index: 2
	cursor: pointer

.-dragging
	.-slider-thumb
		pointer-events: none
</style>
