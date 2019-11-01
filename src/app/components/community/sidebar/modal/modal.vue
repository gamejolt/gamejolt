<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-community-sidebar
				:community="community"
				:is-editing="isEditing"
				:owner="owner"
				:known-members="knownMembers"
				:known-member-count="knownMemberCount"
				:collaborators="collaborators"
				:collaborator-count="collaboratorCount"
				:initial-collaborator-count="initialCollaboratorCount"
			/>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
