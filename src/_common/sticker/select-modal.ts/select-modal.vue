<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Select a Sticker</translate>
			</h2>
		</div>
		<div class="modal-body">
			<div v-if="loading">
				<app-loading />
			</div>
			<template v-else-if="hasStickers">
				<div v-if="canPlace" class="-sticker-list">
					<div
						class="-sticker"
						v-for="stickerCount of stickerCounts"
						:key="stickerCount.sticker.id"
					>
						<img
							:src="stickerCount.sticker.img_url"
							v-app-tooltip="stickerCount.sticker.name"
							@click="selectSticker(stickerCount.sticker)"
						/>
						<div class="-sticker-num">x{{ stickerCount.count }}</div>
					</div>
				</div>
				<div v-else>
					<p>
						<translate
							>This post is already chock full of awesome stickers. Find a different
							post to place more stickers on!</translate
						>
					</p>
				</div>
			</template>
			<div v-else>
				<p><translate>Looks like you don't have any stickers right now...</translate></p>
				<p>
					<translate
						>Maybe check in your collection, you could get some more there!</translate
					>
				</p>
				<router-link :to="{ name: 'dash.stickers.collect' }">
					<app-button>
						<translate>Collect Stickers</translate>
					</app-button>
				</router-link>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-sticker-list
	display: flex
	flex-wrap: wrap

.-sticker
	margin-bottom: 10px
	margin-right: 8px

	& > img
		display: block
		width: 64px
		height: 64px
		cursor: pointer

	&-num
		text-align: center
</style>

<script lang="ts" src="./select-modal"></script>
