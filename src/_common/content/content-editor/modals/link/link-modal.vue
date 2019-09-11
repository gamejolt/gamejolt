<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-form-content-editor-link :model="linkData" @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./link-modal"></script>
