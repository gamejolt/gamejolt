<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../../_common/modal/base';
import { UserAddressModel } from '../../../../../_common/user/address/address.model';
import FormAddress from '../../../forms/address/address.vue';

@Options({
	components: {
		FormAddress,
	},
})
export default class AppUserAddressEditModal extends mixins(BaseModal) {
	@Prop(Object) address!: UserAddressModel;

	onSaved(address: UserAddressModel) {
		this.modal.resolve(address);
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
			<FormAddress :model="address" @submit="onSaved" />
		</div>
	</AppModal>
</template>
