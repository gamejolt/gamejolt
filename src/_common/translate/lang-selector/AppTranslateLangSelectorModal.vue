<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppTranslateLangSelector from '~common/translate/lang-selector/AppTranslateLangSelector.vue';

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title sans-margin-bottom">
				<AppTranslate>Select language</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<AppTranslateLangSelector />

			<AppSpacer vertical :scale="4" />

			<p class="text-muted">
				<AppTranslate>
					Translations are a community project and may not always be complete or accurate.
				</AppTranslate>
			</p>
		</div>
	</AppModal>
</template>
