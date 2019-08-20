<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<app-report-form :type="type" :resource="resource" @submit="onSubmitted" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
