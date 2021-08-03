<script lang="ts" src="./background-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-community-channel-background :model="channel" @submit="onSubmit" />
		</div>
	</app-modal>
</template>
