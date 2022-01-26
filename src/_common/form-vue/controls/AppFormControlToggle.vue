<script lang="ts" setup>
import { toRef } from 'vue';
import {
	createFormControl,
	defineFormControlEmits,
	defineFormControlProps,
} from '../AppFormControl.vue';

const props = defineProps({
	...defineFormControlProps(),
});

const emit = defineEmits({
	...defineFormControlEmits(),
});

const { id, controlVal, applyValue } = createFormControl({
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

	applyValue(!controlVal.value);
}
</script>

<template>
	<div
		:id="id"
		role="checkbox"
		class="toggle"
		:class="{
			'-checked': !!controlVal,
			'-disabled': disabled,
		}"
		:tabindex="disabled ? -1 : 0"
		@click="toggle"
		@keypress.space.prevent="toggle"
		@keypress.enter.prevent="toggle"
	>
		<div class="-knob" />
	</div>
</template>

<style lang="stylus" scoped>
$-toggle-height = 24px
$-toggle-width = $-toggle-height * 2
$-knob-padding = 3px
$-knob-size = $-toggle-height - ($-knob-padding * 2) - ($border-width-base * 2)

.toggle
	change-bg('fg-muted')
	width: $-toggle-width
	height: $-toggle-height
	line-height: $input-height-base
	border-radius: $input-height-base
	border: $border-width-base solid var(--theme-bg-subtle)
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

.-knob
	change-bg('bg')
	width: $-knob-size
	height: $-knob-size
	border-radius: 50%
	position: relative
	left: $-knob-padding
	top: $-knob-padding
	transition: transform $strong-ease-out 300ms

.-checked
	change-bg('bi-bg')

	.-knob
		transform: translateX($-toggle-width / 2)
</style>
