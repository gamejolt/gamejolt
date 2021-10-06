<script lang="ts" src="./placeholder"></script>

<template>
	<div>
		<div class="-item">
			<div class="-sticker-placeholder-circle" />

			<div class="timeline-list-item-title timeline-list-item-title-small -title">
				<div class="-sticker-placeholder-text" style="width: 150px" />
			</div>
		</div>

		<div class="timeline-list-item-split" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-item
	display: flex
	margin-bottom: 8px

.-sticker-placeholder-circle
	lazy-placeholder-block()
	width: 50px
	height: 50px
	border-radius: 50%
	margin-right: 12px
	margin-bottom: 6px

.-sticker-placeholder-text
	lazy-placeholder-inline()

.-title
	margin-top: 14px
</style>
