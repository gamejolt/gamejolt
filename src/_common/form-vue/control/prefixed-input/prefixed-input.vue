<template>
	<div class="-container">
		<input
			ref="input"
			:id="id"
			:name="group.name"
			class="form-control"
			:type="type"
			:value="controlVal"
			@input="onChange"
			v-validate="{ rules: validationRules }"
			:data-vv-validate-on="validateOn"
			:data-vv-delay="validateDelay"
		/>
		<span v-if="prefix" ref="prefix" class="-prefix text-muted">
			<em>{{ prefix }}</em>
		</span>
	</div>
</template>

<style lang="stylus" scoped>

@require '~styles/variables'

.-container
	position: relative

.-prefix
	position: absolute
	pointer-events: none

</style>

<script lang="ts" src="./prefixed-input"></script>
