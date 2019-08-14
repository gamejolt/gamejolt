<template>
	<app-scroll-scroller :overlay="!noOverlayScrollbars" horizontal class="media-bar fill-darker">
		<div class="-items" :style="{ height: mediaBarHeight + 'px' }">
			<div class="-loading-container" v-if="!mediaItems || !mediaItems.length">
				<app-loading centered no-color stationary hide-label />
			</div>

			<div v-if="mediaItems && mediaItems.length">
				<app-media-bar-item
					v-for="item of mediaItems"
					:key="item.id"
					:item="item"
					@click.native="setActiveItem(item)"
				/>
			</div>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
.-loading-container
	position: absolute
	left: 0
	right: 0
	top: 50%

	.loading
		margin-top: -20px

.-items
	position: relative
	padding: 20px 0
	white-space: nowrap
	text-align: center
</style>

<script lang="ts" src="./media-bar"></script>
