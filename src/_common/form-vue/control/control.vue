<template>
	<input
		:id="id"
		:name="group.name"
		class="form-control"
		:type="controlType"
		:value="controlVal"
		@input="onChange"
		v-validate="{ rules: validationRules }"
		:data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay"
	/>
</template>

<script lang="ts" src="./control"></script>
