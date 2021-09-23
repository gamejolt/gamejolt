<script lang="ts" src="./edit-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<app-loading v-if="!controller.fireside" />
			<form-fireside-edit v-else :model="controller.fireside" @submit="onFormSubmit" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-danger-zone
	margin-top: 24px
</style>
