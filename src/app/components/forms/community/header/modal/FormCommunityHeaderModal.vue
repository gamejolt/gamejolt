<script lang="ts" setup>
import { ref } from 'vue';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';
import FormCommunityHeader from '../FormCommunityHeader.vue';

type Props = {
	community: CommunityModel;
};

const { community } = defineProps<Props>();

const modal = useModal()!;

// We don't want to close the modal after they've uploaded a header since they can set a crop
// after. We want to auto-close it after they've saved the crop, though.
const previousHeaderId = ref<number | null>(community.header ? community.header.id : null);

function onSubmit(submittedCommunity: CommunityModel) {
	const newHeaderId = submittedCommunity.header ? submittedCommunity.header.id : null;
	if (!newHeaderId || previousHeaderId.value === newHeaderId) {
		modal.resolve(community);
		return;
	}
	previousHeaderId.value = newHeaderId;
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
			<FormCommunityHeader :model="community" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
