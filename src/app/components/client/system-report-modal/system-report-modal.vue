<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { BaseModal } from '../../../../_common/modal/base';
import { Translate } from '../../../../_common/translate/translate.service';
import FormClientSystemReport from './system-report-form.vue';

@Options({
	components: {
		FormClientSystemReport,
	},
})
export default class AppClientSystemReportModal extends mixins(BaseModal) {
	onSubmit() {
		showSuccessGrowl(
			Translate.$gettext('Your system report has been sent.'),
			Translate.$gettext('Report Sent')
		);
		this.modal.dismiss();
	}
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
			<h2 class="modal-title">
				<AppTranslate>Send System Report</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<p class="text-muted small">
				<AppTranslate>
					This will send a system report to us with details about your device and client
					log. We don't collect personal information through this.
				</AppTranslate>
			</p>

			<p class="text-muted small" v-translate>
				If you experienced a bug, please report it first on our
				<AppLinkExternal href="https://github.com/gamejolt/issue-tracker" target-self>
					issue tracker
				</AppLinkExternal>
			</p>

			<FormClientSystemReport @submit="onSubmit" />
		</div>
	</AppModal>
</template>
