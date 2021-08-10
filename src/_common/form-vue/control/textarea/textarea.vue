<script lang="ts" src="./textarea"></script>

<template>
	<textarea
		:id="id"
		v-validate="{ rules: validationRules }"
		:name="group.name"
		class="form-control"
		:value="controlVal"
		:data-vv-validate-on="validateOn"
		:data-vv-delay="validateDelay"
		@input="onChange($event.target.value)"
		@paste="emitPaste"
	/>
</template>
