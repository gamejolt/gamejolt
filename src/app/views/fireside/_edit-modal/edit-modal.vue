<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FiresideController } from '../../../components/fireside/controller/controller';
import FormFiresideEdit from '../../../components/forms/fireside/edit/edit.vue';

@Options({
	components: {
		FormFiresideEdit,
		AppLoading,
	},
})
export default class AppFiresideEditModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	controller!: FiresideController;

	onFormSubmit() {
		this.modal.resolve();
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
		<div class="modal-body">
			<AppLoading v-if="!controller.fireside" />
			<FormFiresideEdit v-else :model="controller.fireside" @submit="onFormSubmit" />
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-danger-zone
	margin-top: 24px
</style>
