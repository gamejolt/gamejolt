<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Collect Sticker</translate>
			</h2>
		</div>
		<div class="modal-body">
			<app-loading v-if="isLoading" centered />
			<app-sticker-collect
				v-else
				:balance="balance"
				:sticker-cost="stickerCost"
				@sticker-purchase="onStickerPurchase"
			/>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>

<script lang="ts" src="./modal"></script>
