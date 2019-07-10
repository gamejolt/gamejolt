<template>
	<div class="event-item-media-indicator">
		<div
			v-for="i of count"
			class="-dot"
			:class="{
				'-active': current === i,
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.event-item-media-indicator
	display: flex
	justify-content: center
	align-items: center

.-dot
	change-bg('bg-subtle')
	margin-right: 2px
	margin-left: 2px
	width: 6px
	height: 6px
	border-radius: 50%

.-active
	change-bg('link')
</style>

<script lang="ts" src="./media-indicator"></script>
