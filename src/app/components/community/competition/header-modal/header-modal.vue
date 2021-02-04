<script lang="ts" src="./header-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<form-community-competition-header :model="competition" @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
