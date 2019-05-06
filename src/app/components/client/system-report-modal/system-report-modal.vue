<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				<translate>system_report.send.heading</translate>
			</h2>
		</div>

		<div class="modal-body">
			<p class="text-muted small">
				<translate>system_report.send.help</translate>
			</p>

			<p class="text-muted small" v-translate>
				If you experienced a bug, please report it first on our
				<external-link href="https://github.com/gamejolt/issue-tracker">
					issue tracker
				</external-link>
			</p>

			<form-client-system-report @submit="onSubmit" />
		</div>
	</app-modal>
</template>

<script lang="ts" src="./system-report-modal"></script>
