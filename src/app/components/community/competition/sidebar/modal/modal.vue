<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-community-competition-sidebar
				:community="community"
				:channel="channel"
			/>
		</div>
	</app-modal>
</template>
