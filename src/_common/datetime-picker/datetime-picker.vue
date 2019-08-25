<template>
	<div class="datetime-picker">
		<app-datepicker
			required
			:value="datetime"
			@input="select($event)"
			:min-date="minDateBounds"
			:max-date="maxDateBounds"
		/>

		<app-timepicker :value="datetime" @input="select($event)" :show-meridian="true" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.datetime-picker
	clearfix()

	>>> .datepicker-table
		float: left
		margin-right: ($grid-gutter-width / 2)

		@media $media-xs
			float: none
			margin-right: 0

	>>> .timepicker
		float: left

		@media $media-xs
			float: none
			margin-top: $line-height-computed
</style>

<script lang="ts" src="./datetime-picker"></script>
