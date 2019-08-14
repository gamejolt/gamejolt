<template>
	<div class="colorpicker">
		<app-popper>
			<!-- position-horizontal="left"
			@focused="isOpen = true"
			@blurred="isOpen = false" -->
			<div
				class="color"
				:class="{ empty: !colors.hex }"
				:style="{
					'background-color': colors.hex,
				}"
			></div>

			<div class="colorpicker-popover" slot="popover">
				<picker :value="colors" @input="onChange" />

				<div class="colorpicker-well">
					<div class="col">
						<app-button primary solid block @click="accept">
							<translate>Accept</translate>
						</app-button>
					</div>
					<div class="col">
						<app-button trans block @click="cancel">
							<translate>Cancel</translate>
						</app-button>
					</div>
				</div>
			</div>
		</app-popper>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.colorpicker
	display: inline-block
	vertical-align: middle

.color
	theme-prop('border-color', 'lighter')
	img-circle()
	display: inline-block
	width: $line-height-computed
	height: $line-height-computed
	border-width: $border-width-base
	border-style: solid
	cursor: pointer

	// Checkerboard pattern
	&.empty
		background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)
		background-size: 10px 10px
		background-position: 0 0, 0 5px, 5px -5px, -5px 0

.colorpicker-well
	clearfix()
	padding: 5px 0

	.col
		float: left
		width: 50%
		padding: 0 5px

.colorpicker-popover
	>>> .vue-color__sketch
		box-shadow: none
</style>

<script lang="ts" src="./colorpicker"></script>
