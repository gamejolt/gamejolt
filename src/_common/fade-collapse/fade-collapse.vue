<template>
	<div
		class="fade-collapse"
		:class="{
			'-sm': this.size === 'sm',
			'-animate': this.animate,
			'fade-collapse-collapsed': this.isCollapsed,
		}"
		@transitionend="afterTransition"
	>
		<div class="-fade" @click="fadeClick($event)"></div>
		<slot></slot>
	</div>
</template>

<style lang="stylus" src="./fade-collapse.styl" scoped></style>

<script lang="ts" src="./fade-collapse"></script>
