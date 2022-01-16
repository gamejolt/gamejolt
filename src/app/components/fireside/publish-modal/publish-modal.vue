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
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Publish your fireside?</translate>
			</h2>
		</div>
		<div class="modal-body">
			<p>
				<translate>This will make it visible for everyone.</translate>
			</p>
			<form-fireside-publish :fireside="fireside" @submit="onFormSubmit" />
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped></style>
