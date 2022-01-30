<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../_common/modal/base';
import { FormModel } from '../../forms/fireside/publish/publish';
import FormFiresidePublish from '../../forms/fireside/publish/publish.vue';
import { FiresidePublishModalResult } from './publish-modal.service';

@Options({
	components: {
		FormFiresidePublish,
	},
})
export default class AppFiresidePublishModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) fireside!: Fireside;

	onFormSubmit(formData: FormModel) {
		this.modal.resolve({
			doPublish: true,
			autoFeature: formData.auto_feature,
		} as FiresidePublishModalResult);
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
				<AppTranslate>Publish your fireside?</AppTranslate>
			</h2>
		</div>
		<div class="modal-body">
			<p>
				<AppTranslate>This will make it visible for everyone.</AppTranslate>
			</p>
			<FormFiresidePublish :fireside="fireside" @submit="onFormSubmit" />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
