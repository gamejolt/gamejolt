<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<app-block-form v-if="page === 'block'" :user="resource" @submit="onSubmittedBlock" />
			<app-report-form v-else :type="type" :resource="resource" @submit="onSubmittedReport" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./modal"></script>
