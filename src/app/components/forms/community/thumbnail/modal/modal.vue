<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-community-thumbnail :model="community" @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
