<script lang="ts" src="./rename-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Rename Channel</translate>
			</h2>
		</div>
		<div class="modal-body">
			<form-community-channel
				:model="channel"
				:community="community"
				:channels="channels"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>
