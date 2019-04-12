<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-user-header :model="app.user" @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./header-modal"></script>
