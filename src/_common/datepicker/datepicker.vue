<script lang="ts" src="./datepicker"></script>

<template>
	<div>
		<app-datepicker-day v-if="pickerMode === 'day'" v-model="viewDate" @selected="select" />
		<app-datepicker-month v-if="pickerMode === 'month'" v-model="viewDate" />
	</div>
</template>

<style lang="stylus">
@import './datepicker-buttons'
@import './datepicker-tables'
</style>
