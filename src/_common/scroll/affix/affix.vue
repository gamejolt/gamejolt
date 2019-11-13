<template>
	<app-scroll-inview
		:margin="inviewMargin"
		emits-on="full-overlap"
		@inview="inview"
		@outview="outview"
	>
		<div
			ref="placeholder"
			class="gj-scroll-affix-placeholder"
			v-if="isAffixed"
			:style="{ height: `${height}px` }"
		/>

		<div
			ref="container"
			class="scroll-affix-container"
			:style="{ width: isAffixed ? `${width}px` : null }"
			:class="cssClasses"
		>
			<slot></slot>
		</div>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
.gj-scroll-affixed
	position: fixed

.-anchor-top
	top: 0

.-anchor-bottom
	bottom: 0
</style>

<script lang="ts" src="./affix"></script>
