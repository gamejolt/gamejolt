<template>
	<div>
		<app-datetime-picker
			:id="id"
			:value="controlVal"
			@input="onChange"
			:timezone-offset="timezoneOffset"
			:min-date="minDate"
			:max-date="maxDate"
		/>

		<input
			class="hidden"
			type="number"
			:name="group.name"
			v-model="controlVal"
			v-validate="{ rules: validationRules }"
		/>
	</div>
</template>

<script lang="ts" src="./date"></script>
