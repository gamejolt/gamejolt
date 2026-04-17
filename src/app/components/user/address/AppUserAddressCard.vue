<script lang="ts" setup>
import AppUserAddressDetails from '~app/components/user/address/AppUserAddressDetails.vue';
import { showUserAddressEditModal } from '~app/components/user/address/edit-modal/edit-modal.service';
import AppButton from '~common/button/AppButton.vue';
import AppCard from '~common/card/AppCard.vue';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { $removeUserAddress, UserAddressModel } from '~common/user/address/address.model';

type Props = {
	address: UserAddressModel;
	showRemove?: boolean;
};
const { address, showRemove } = defineProps<Props>();

const emit = defineEmits<{
	remove: [];
}>();

function edit() {
	showUserAddressEditModal(address);
}

async function remove() {
	const result = await showModalConfirm(`Are you sure you want to remove this address?`);
	if (!result) {
		return;
	}

	await $removeUserAddress(address);

	showSuccessGrowl(
		$gettext(`Your address has successfully been removed.`),
		$gettext(`Address Removed`)
	);

	emit('remove');
}
</script>

<template>
	<AppCard>
		<a v-if="showRemove" class="card-remove" @click="remove()">
			<AppJolticon icon="remove" />
		</a>

		<div class="card-content">
			<AppUserAddressDetails :address="address" />
		</div>

		<div class="card-controls">
			<AppButton primary solid @click="edit()">
				<AppTranslate>Edit</AppTranslate>
			</AppButton>
		</div>
	</AppCard>
</template>
