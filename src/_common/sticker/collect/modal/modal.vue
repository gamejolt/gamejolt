<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="onClose">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Unlock Sticker</translate>
			</h2>
		</div>
		<div class="modal-body">
			<app-loading v-if="isLoading" centered />
			<app-sticker-collect
				v-else
				:balance="balance"
				:sticker-cost="stickerCost"
				@collect="onCollected"
			/>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
