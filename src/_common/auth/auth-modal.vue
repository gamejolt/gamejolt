<script lang="ts" src="./auth-modal"></script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<div class="-auth-container">
				<app-auth-join />
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
.-auth-container
	max-width: 350px
	margin: 0 auto
</style>
