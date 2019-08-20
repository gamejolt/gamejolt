<template>
	<div class="content-control">
		<!--
			Use fill-bg so that this control can be placed within any other fill
			and it'll reset back to the BG background color/theming.
		-->
		<app-content-editor
			class="fill-bg form-control content-editor-form-control"
			:name="group.name"
			:id="id"
			:content-context="contentContext"
			:placeholder="placeholder"
			:disabled="disabled"
			:autofocus="autofocus"
			:model-id="modelId"
			:value="controlVal"
			:min-height="minHeight"
			:startup-activity="startupActivity"
			v-validate="{ rules: validationRules }"
			@input="onChange"
			@editor-focus="onFocus"
			@editor-blur="onBlur"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.content-control
	cursor: text
	// Add a min height because app-content-editor is a lazy control.
	// Otherwise surrounding areas would move around the first time content editor is loaded in.
	// This is only an approximation of the most common default size,
	// might not always be correct, but at least it's something.
	min-height: ($line-height-computed + 22)

.content-editor-form-control
	height: auto
	resize: vertical

.content-editor-form-control:focus-within
	theme-prop('border-color', 'fg-muted')
	box-shadow: none
	outline: 0
</style>

<script lang="ts" src="./content"></script>
