<script lang="ts" src="./slider"></script>

<template>
	<div class="-slider">
		<div class="-mask" @mousedown="onMouseDown" @touchstart="onMouseDown" />

		<div
			ref="slider"
			class="-inner"
			:class="{ '-dragging': isDragging }"
			:style="sliderStyling"
		>
			<div class="-inner-filled" :style="sliderFilledStyling" />

			<div
				ref="thumb"
				v-app-tooltip="readableSliderPercentage"
				class="-inner-thumb"
				:style="thumbStyling"
				@mousedown="onMouseDown"
				@touchstart="onMouseDown"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-slider
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

.-inner
	border-radius: $border-radius-small
	position: relative
	margin: auto
	background-color: rgba($white, 0.5)
	display: flex
	justify-content: center
	align-items: center
	flex: auto

	&-filled
		position: absolute
		background-color: $white
		border-radius: $border-radius-small

.-inner-thumb
	position: absolute
	border-radius: 50%
	background-color: $white
	z-index: 2
	cursor: pointer

.-dragging
	.-inner-thumb
		pointer-events: none
</style>
