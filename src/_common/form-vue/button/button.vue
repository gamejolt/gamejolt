<template>
	<app-button
		v-if="shouldShow"
		:primary="primary"
		:trans="trans"
		:solid="solid"
		:block="block"
		:disabled="form.base.state.isProcessing"
		:icon="icon"
		@click.native="onClick"
	>
		<slot />
		<transition>
			<app-jolticon
				v-if="form.base.state.isShowingSuccess"
				class="form-success-icon"
				icon="check"
			/>
		</transition>
	</app-button>
</template>

<style lang="stylus" scoped>
.form-success-icon
	margin-right: 0
	width: 20px
	overflow: hidden
	transition: opacity 300ms, width 300ms

	&.v-enter
	&.v-leave-to
		opacity: 0
		width: 0
</style>

<script lang="ts" src="./button"></script>
