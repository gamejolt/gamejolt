<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-auth-join />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./auth-modal"></script>
