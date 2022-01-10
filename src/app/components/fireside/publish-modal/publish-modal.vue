<script lang="ts" src="./publish-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Publish your fireside?</translate>
			</h2>
		</div>
		<div class="modal-body">
			<p>
				<translate>This will make it visible for everyone.</translate>
			</p>
			<form-fireside-publish :fireside="fireside" @submit="onFormSubmit" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
