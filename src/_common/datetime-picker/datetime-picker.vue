<script lang="ts" src="./datetime-picker"></script>

<template>
	<div class="datetime-picker">
		<app-datepicker
			required
			:value="datetime"
			:min-date="minDateBounds"
			:max-date="maxDateBounds"
			@change="select($event)"
		/>

		<app-timepicker :value="datetime" :show-meridian="true" @change="select($event)" />
	</div>
</template>

<style lang="stylus" scoped>
.datetime-picker
	clearfix()

	::v-deep(.datepicker-table)
		float: left
		margin-right: ($grid-gutter-width / 2)

		@media $media-xs
			float: none
			margin-right: 0

	::v-deep(.timepicker)
		float: left

		@media $media-xs
			float: none
			margin-top: $line-height-computed
</style>
