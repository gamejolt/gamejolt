<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate :translate-params="{ title: channel.title }">
					Remove "%{ title }" channel?
				</translate>
			</h2>
		</div>

		<div class="modal-body">
			<app-community-remove-channel
				:community="community"
				:channel="channel"
				@removed="onRemoved"
			/>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
