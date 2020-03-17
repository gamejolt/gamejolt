<template>
	<div class="-stickers-tray fill-offset" @click.stop>
		<div
			v-for="stickerCount of stickerCounts"
			:key="stickerCount.sticker.id"
			class="-sticker"
			draggable="true"
			@dragstart="$ev => onDragStart($ev, stickerCount.sticker.id)"
		>
			<img
				:src="stickerCount.sticker.media_item.mediaserver_url"
				v-app-tooltip="stickerCount.sticker.name"
			/>
			<span>x{{ stickerCount.count }}</span>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-stickers-tray
	margin-top: 8px
	padding: 8px
	rounded-corners-lg()
	cursor: auto

.-sticker
	display: inline-flex
	flex-direction: column
	align-items: center
	margin-right: 8px
	cursor: grab

	& > img
		display: block
		width: 64px
		height: 64px
</style>

<script lang="ts" src="./tray"></script>
