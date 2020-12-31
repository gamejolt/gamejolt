<script lang="ts" src="./control"></script>

<template>
	<input
		:id="id"
		v-validate="{ rules: validationRules }"
		:data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay"
		:name="group.name"
		class="form-control"
		:type="controlType"
		:value="controlVal"
		:disabled="disabled"
		@input="onChange"
	/>
</template>
