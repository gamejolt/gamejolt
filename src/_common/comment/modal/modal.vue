<script lang="ts" src="./modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-comment-widget
				:model="model"
				:autofocus="autofocusAdd"
				:initial-tab="initialTab"
				:display-mode="displayMode"
			/>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
::v-deep(.timeline-list-item-split)
	full-bleed()
</style>
