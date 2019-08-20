<template>
	<div class="expand" @transitionend="afterTransition">
		<div v-if="inDom" class="clearfix">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.expand
	overflow: hidden
	transition: height 600ms $strong-ease-out

	&.transition
		height: 0
</style>

<script lang="ts" src="./expand"></script>
