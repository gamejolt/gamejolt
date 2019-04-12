<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-address :model="address" @submit="onSaved" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./edit-modal"></script>
