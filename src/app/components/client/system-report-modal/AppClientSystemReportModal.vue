<script lang="ts" setup>
import FormClientSystemReport from '~app/components/client/system-report-modal/FormClientSystemReport.vue';
import AppButton from '~common/button/AppButton.vue';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

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
