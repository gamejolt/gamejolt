<template>
	<div>
		<div v-if="isWizard">
			<hr />

			<div class="pull-right">
				<app-form-button v-if="inForm" :disabled="!canProceed" @after-submit="next">
					<translate>Save & Next</translate>
				</app-form-button>
				<app-button v-else :disabled="!canProceed" @click="next">
					<translate>Next Step</translate>
				</app-button>
			</div>
		</div>
		<div v-else>
			<slot />
		</div>
	</div>
</template>

<script lang="ts" src="./wizard-controls"></script>
