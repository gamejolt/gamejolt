<script lang="ts" src="./sticker-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Select Sticker</translate>
			</h2>
		</div>
		<div class="modal-body">
			<app-loading v-if="isLoading" />
			<div v-else-if="stickers.length === 0">
				<app-illustration src="~img/ill/no-comments.svg">
					<p>
						<translate>You have no more stickers.</translate>
					</p>
					<p>
						<translate>Go like some posts to get more!</translate>
					</p>
				</app-illustration>
			</div>
			<div v-else class="-item-container">
				<div
					v-for="sticker of stickers"
					:key="sticker.sticker_id"
					class="-item"
					@click="onClickSticker(sticker.sticker)"
				>
					<img class="-img" :src="sticker.sticker.img_url" />
					<div class="-pocket badge fill-dark">
						<div
							class="-rarity"
							:class="{
								'-rarity-uncommon': sticker.sticker.rarity === 1,
								'-rarity-rare': sticker.sticker.rarity === 2,
								'-rarity-epic': sticker.sticker.rarity === 3,
							}"
						>
							{{ sticker.count }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-item-container
	display: flex
	flex-wrap: wrap

.-item
	position: relative
	height: 64px
	width: 64px
	margin-left: 8px
	margin-right: 8px
	margin-bottom: 8px

.-img
	display: block
	height: 64px
	width: 64px
	transition: filter 0.1s ease
	cursor: pointer

	&:hover
		filter: drop-shadow(0 0 10px var(--theme-highlight))

.-pocket
	position: absolute
	bottom: 0
	right: 0
	pointer-events: none

.-rarity
	font-weight: bold

	&-uncommon
		color: #1bb804

	&-rare
		color: #18a5f2

	&-epic
		color: #ffbc56
</style>
