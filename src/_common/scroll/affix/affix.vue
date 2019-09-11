<template>
	<div>
		<div
			ref="placeholder"
			class="gj-scroll-affix-placeholder"
			v-if="isAffixed"
			:style="{ height: placeholderHeight + 'px' }"
		></div>

		<div ref="container" class="scroll-affix-container" :style="{ width }" :class="cssClasses">
			<slot></slot>
		</div>
	</div>
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
