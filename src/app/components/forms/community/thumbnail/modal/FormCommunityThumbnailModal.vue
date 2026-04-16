<script lang="ts" setup>
import { ref } from 'vue';

import FormCommunityThumbnail from '~app/components/forms/community/thumbnail/FormCommunityThumbnail.vue';
import AppButton from '~common/button/AppButton.vue';
import { CommunityModel } from '~common/community/community.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';

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
