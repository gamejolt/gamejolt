<script lang="ts" setup>
import AppButtonPlaceholder from '../../button/AppButtonPlaceholder.vue';
</script>

<template>
	<div class="community-card-placeholder sheet sheet-full sheet-no-full-bleed">
		<div class="-info">
			<div class="-header" />

			<div class="-thumbnail">
				<slot name="thumbnail" />
			</div>

			<div class="-well fill-bg">
				<div class="-name" />
				<div class="-member-counts" />
				<div class="-controls">
					<AppButtonPlaceholder block />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.community-card-placeholder
	rounded-corners-lg()
	margin-bottom: $line-height-computed
	overflow: hidden

.-well
	position: relative
	padding: 10px

.-info
	change-bg('bg')

.-header
	change-bg('bg-subtle')
	height: 100px

.-thumbnail
	change-bg('bg-subtle')
	img-circle()
	position: relative
	display: block
	width: 100px
	height: 100px
	margin-top: -(@width * (1 - 0.618))
	margin-left: auto
	margin-right: auto
	border: 4px solid var(--theme-bg)
	overflow: hidden
	z-index: 2

.-name
	lazy-placeholder-block()
	height: $font-size-large + 10px
	width: 50%
	margin-left: auto
	margin-right: auto
	margin-bottom: 4px

.-member-counts
	lazy-placeholder-block()
	height: $font-size-small
	width: 30%
	margin-left: auto
	margin-right: auto

.-controls
	margin-top: $line-height-computed
</style>
