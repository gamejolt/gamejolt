<template>
	<div
		class="progress"
		:class="[
			thin ? 'progress-thin' : undefined,
			variant ? 'progress-' + variant : undefined,
			indeterminate ? 'progress-striped' : undefined,
			active ? 'active' : undefined,
			animate ? 'animate' : undefined,
		]"
	>
		<div class="progress-bar" :style="{ width: Math.max(0, Math.min(100, percent)) + '%' }"></div>
		<div class="-text">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" src="./bar.styl" scoped></style>

<script lang="ts" src="./bar"></script>
