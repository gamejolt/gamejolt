<template>
	<transition>
		<div class="loading-bar anim-fade-enter anim-fade-leave" v-if="width > 0 && shouldShow">
			<div class="loading-bar-bar" :style="{ width: width + '%' }"></div>
		</div>
	</transition>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.loading-bar
	position: fixed
	top: 0
	left: 0
	right: 0
	height: 3px
	pointer-events: none
	z-index: $zindex-loading-bar

	&-bar
		change-bg('highlight')
		height: 3px
		transition: width 300ms $strong-ease-out
		will-change: width
</style>

<script lang="ts" src="./bar"></script>
