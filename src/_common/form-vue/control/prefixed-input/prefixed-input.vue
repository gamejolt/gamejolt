<script lang="ts" src="./prefixed-input"></script>

<template>
	<div class="-container">
		<input
			:id="id"
			ref="input"
			v-validate="{ rules: validationRules }"
			:name="group.name"
			class="form-control"
			:type="type"
			:value="controlVal"
			:data-vv-validate-on="validateOn"
			:data-vv-delay="validateDelay"
			:disabled="disabled"
			@input="onChange"
		/>
		<span v-if="prefix" ref="prefix" class="-prefix text-muted">
			<em>{{ prefix }}</em>
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-container
	position: relative

.-prefix
	position: absolute
	pointer-events: none
</style>
