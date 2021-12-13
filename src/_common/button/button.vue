<script lang="ts" src="./button"></script>

<template>
	<component
		:is="ourTag"
		type="button"
		class="button"
		:class="{
			'-primary': primary,
			'-trans': trans,
			'-outline': !solid,
			'-overlay': overlay,
			'-circle': circle,
			'-sparse': sparse || circle,
			'-lg': lg,
			'-sm': sm,
			'-block': block,
			'-block-xs': blockXs,
			'-disabled': disabled,
		}"
		:to="to"
		:disabled="disabled === true ? 'disabled' : null"
	>
		<span v-if="badge" class="-badge">{{ badge }}</span>
		<app-jolticon v-if="icon" class="-icon" :icon="icon" :big="lg" />
		<slot />
	</component>
</template>

<style lang="stylus" src="./button.styl" scoped></style>
