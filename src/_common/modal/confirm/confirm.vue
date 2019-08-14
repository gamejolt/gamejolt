<template>
	<app-modal>
		<div class="modal-header">
			<h2 class="modal-title">
				{{ title }}
			</h2>
		</div>

		<div class="modal-body">
			<p>{{ message }}</p>
		</div>

		<div class="modal-footer">
			<app-button primary solid @click="ok">
				<translate v-if="buttonType === 'ok'">OK</translate>
				<translate v-else-if="buttonType === 'yes'">Yes</translate>
			</app-button>
			<app-button trans @click="cancel">
				<translate v-if="buttonType === 'ok'">Cancel</translate>
				<translate v-else-if="buttonType === 'yes'">No</translate>
			</app-button>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./confirm"></script>
