<script lang="ts" src="./affix"></script>

<template>
	<app-scroll-inview
		:config="InviewConfig"
		emits-on="full-overlap"
		@inview="inview"
		@outview="outview"
	>
		<div
			v-if="isAffixed"
			ref="placeholder"
			class="gj-scroll-affix-placeholder"
			:style="{ height: `${height}px` }"
		/>

		<div
			ref="container"
			class="scroll-affix-container"
			:style="{ width: isAffixed ? `${width}px` : null }"
			:class="cssClasses"
		>
			<slot />
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
