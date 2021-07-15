<script lang="ts" src="./fade-collapse"></script>

<template>
	<div
		class="fade-collapse"
		:class="{
			'-sm': size === 'sm',
			'-animate': animate,
			'fade-collapse-collapsed': isCollapsed,
		}"
		@transitionend="afterTransition"
	>
		<div class="-fade" @click="fadeClick($event)" />
		<slot />
	</div>
</template>

<style lang="stylus" src="./fade-collapse.styl" scoped></style>
