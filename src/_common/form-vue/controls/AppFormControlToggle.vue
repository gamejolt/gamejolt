<script lang="ts" setup>
import { toRef } from 'vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';

const props = defineProps({
	...defineFormControlProps(),
	disabled: {
		type: Boolean,
	},
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const c = createFormControl({
	initialValue: false,
	validators: toRef(props, 'validators'),
	// eslint-disable-next-line vue/require-explicit-emits
	onChange: val => emit('changed', val),
	alwaysOptional: true,
});

function toggle() {
	if (props.disabled) {
		return;
	}

	c.applyValue(!c.controlVal);
}
</script>

<template>
	<span
		:id="c.id"
		role="checkbox"
		class="toggle"
		:class="{
			'-checked': !!c.controlVal,
			'-disabled': disabled,
		}"
		:tabindex="disabled ? -1 : 0"
		@click="toggle"
		@keypress.space.prevent="toggle"
		@keypress.enter.prevent="toggle"
	>
		<span class="-knob" />
	</span>
</template>

<style lang="stylus" scoped>
$-toggle-width = $input-height-base * 2 // + $toggle-padding * 2
$-knob-border-width = 2px

.toggle
	change-bg('bg-subtle')
	display: block
	width: $-toggle-width
	height: $input-height-base
	line-height: $input-height-base
	border-radius: $input-height-base
	vertical-align: top
	transition: all ease-in-out 300ms
	text-align: left
	cursor: pointer
	user-select: none
	outline: 0

	&[disabled], &.-disabled
		opacity: 0.5
		cursor: not-allowed !important

	.form-horizontal &
		margin-top: ($padding-base-vertical + 1px)

.-checked
	change-bg('link')

.-knob
	change-bg('bg')
	theme-prop('border-color', 'bg-subtle')
	display: block
	width: $input-height-base
	height: @width
	border-radius: @width
	border-width: $-knob-border-width
	border-style: solid
	// This will allow the border to overflow outside the toggle.
	box-sizing: content-box
	position: relative
	top: -($-knob-border-width)
	left: -($-knob-border-width)
	transition: transform $strong-ease-out 300ms

	.-checked &
		theme-prop('border-color', 'link')
		transform: translateX($input-height-base)
</style>
