<template>
	<textarea
		:id="id"
		:name="group.name"
		class="form-control"
		:value="controlVal"
		@input="onChange($event.target.value)"
		v-validate="{ rules: validationRules }"
		:data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay"
		@paste="emitPaste"
	></textarea>
</template>

<script lang="ts" src="./textarea"></script>
