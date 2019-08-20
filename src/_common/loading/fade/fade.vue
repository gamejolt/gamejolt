<template>
	<div class="loading-fade" :class="{ 'loading-fade-loading': isLoading }">
		<div class="loading-fade-img" v-if="isLoading">
			<app-loading centered hide-label stationary />
		</div>
		<div class="loading-fade-content">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.loading-fade
	position: relative

	&-img
		position: absolute
		top: 20px
		left: 0
		right: 0
		z-index: 1

	&-loading

		.loading-fade-content
			opacity: 0.5
			pointer-events: none
</style>

<script lang="ts" src="./fade"></script>
