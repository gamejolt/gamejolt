<script lang="ts" src="./stream-setup-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<app-stream-setup :fireside-host-rtc="firesideHostRtc" />
		</div>
	</app-modal>
</template>
