<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<app-fireside-stats :status="status" :is-streaming="isStreaming" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
