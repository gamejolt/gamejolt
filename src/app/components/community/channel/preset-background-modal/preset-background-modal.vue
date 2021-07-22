<script lang="ts" src="./preset-background-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<form-community-channel-preset-background
				:model="community"
				:preset-type="presetType"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>
