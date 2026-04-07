<script lang="ts" setup>
import { useModal } from '../../../../../_common/modal/modal.service';
import { UserAddressModel } from '../../../../../_common/user/address/address.model';
import FormAddress from '../../../forms/address/FormAddress.vue';

type Props = {
	address: UserAddressModel;
};

const { address } = defineProps<Props>();

const modal = useModal()!;

function onSaved(savedAddress: UserAddressModel) {
	modal.resolve(savedAddress);
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
