<template>
	<div>
		<app-datepicker-day v-if="pickerMode === 'day'" v-model="viewDate" @selected="select" />

		<app-datepicker-month v-if="pickerMode === 'month'" v-model="viewDate" />
	</div>
</template>

<style lang="stylus">
@require './datepicker-buttons'
@require './datepicker-tables'
</style>

<script lang="ts" src="./datepicker"></script>
