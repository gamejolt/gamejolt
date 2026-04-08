<script lang="ts" setup>
import { ref } from 'vue';

import AppButton from '../../../../../../_common/button/AppButton.vue';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import AppModal from '../../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../../_common/modal/modal.service';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';
import FormCommunityThumbnail from '../FormCommunityThumbnail.vue';

type Props = {
	community: CommunityModel;
};

const { community } = defineProps<Props>();

const modal = useModal()!;

// We don't want to close the modal after they've uploaded a thumbnail since they can set a crop
// after. We want to auto-close it after they've saved the crop, though.
const previousThumbnailId = ref<number | null>(community.thumbnail ? community.thumbnail.id : null);

function onSubmit(submittedCommunity: CommunityModel) {
	const newThumbnailId =
		(submittedCommunity.thumbnail && submittedCommunity.thumbnail.id) || null;
	if (previousThumbnailId.value === newThumbnailId) {
		modal.resolve(community);
	}
	previousThumbnailId.value = newThumbnailId;
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
			<FormCommunityThumbnail :model="community" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
