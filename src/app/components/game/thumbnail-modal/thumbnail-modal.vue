<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-game-thumbnail :model="game" @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./thumbnail-modal"></script>
