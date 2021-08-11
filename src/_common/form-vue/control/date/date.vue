<script lang="ts" src="./date"></script>

<template>
	<div>
		<app-datetime-picker
			:id="id"
			:value="controlVal"
			:timezone-offset="timezoneOffset"
			:min-date="minDate"
			:max-date="maxDate"
			@change="onChange"
		/>

		<input
			v-model="controlVal"
			v-validate="{ rules: validationRules }"
			class="hidden"
			type="number"
			:name="group.name"
		/>
	</div>
</template>
