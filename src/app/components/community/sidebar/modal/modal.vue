<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-community-sidebar
				:is-editing="isEditing"
				:community="community"
				:sidebar-data="sidebarData"
			/>
		</div>
	</app-modal>
</template>
