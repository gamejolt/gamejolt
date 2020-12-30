<script lang="ts" src="./change-url-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Change Channel URL</translate>
			</h2>
		</div>
		<div class="modal-body">
			<form-community-channel-change-url
				:model="channel"
				:community="community"
				:channels="channels"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>
