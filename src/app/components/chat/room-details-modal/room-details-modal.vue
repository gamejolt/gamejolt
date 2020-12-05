<script lang="ts" src="./room-details-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Edit group details</translate>
			</h2>
		</div>

		<div class="modal-body">
			<form-room-details :model="room" @submit="onSubmit($event)" />
		</div>
	</app-modal>
</template>
