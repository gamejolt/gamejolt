<script lang="ts" setup>
import FormAddress from '~app/components/forms/address/FormAddress.vue';
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { UserAddressModel } from '~common/user/address/address.model';

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
