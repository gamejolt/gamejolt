<template>
	<span class="event-item-media-tags">
		<span class="-tag" v-if="gif">
			GIF
		</span>
	</span>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.event-item-media-tags
	position: absolute
	top: 10px
	right: 10px
	z-index: 5

.-tag
	rounded-corners()
	theme-prop('color', 'white')
	background-color: $black
	padding: 5px
	font-weight: bold
	font-size: $font-size-small
</style>

<script lang="ts" src="./media-tags"></script>
