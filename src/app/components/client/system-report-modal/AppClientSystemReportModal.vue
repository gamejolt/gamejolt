<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import FormClientSystemReport from './FormClientSystemReport.vue';

const modal = useModal()!;

function onSubmit() {
	showSuccessGrowl($gettext(`Your system report has been sent.`), $gettext(`Report sent`));
	modal.dismiss();
}
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
				<AppTranslate>Send system report</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p class="text-muted small">
				<AppTranslate>
					This will send a system report to us with details about your device and client
					log. We don't collect personal information through this.
				</AppTranslate>
			</p>

			<AppSpacer vertical :scale="4" />

			<FormClientSystemReport @submit="onSubmit" />
		</div>
	</AppModal>
</template>
