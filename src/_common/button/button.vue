<template>
	<component
		:is="ourTag"
		type="button"
		class="button"
		:class="{
			'-primary': this.primary,
			'-trans': this.trans,
			'-outline': !this.solid,
			'-overlay': this.overlay,
			'-circle': this.circle,
			'-sparse': this.sparse || this.circle,
			'-lg': this.lg,
			'-sm': this.sm,
			'-block': this.block,
			'-block-xs': this.blockXs,
			'-disabled': this.disabled,
		}"
		:to="to"
		:disabled="this.disabled"
		@click="onClick"
	>
		<span v-if="badge" class="-badge">{{ badge }}</span>
		<app-jolticon class="-icon" v-if="icon" :icon="icon" :big="lg" />
		<slot />
	</component>
</template>

<style lang="stylus" src="./button.styl" scoped></style>

<script lang="ts" src="./button"></script>
