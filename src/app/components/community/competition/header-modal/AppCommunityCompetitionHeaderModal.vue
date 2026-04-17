<script lang="ts" setup>
import { ref } from 'vue';

import FormCommunityCompetitionHeader from '~app/components/forms/community/competition/header/FormCommunityCompetitionHeader.vue';
import AppButton from '~common/button/AppButton.vue';
import { CommunityCompetitionModel } from '~common/community/competition/competition.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	competition: CommunityCompetitionModel;
};
const { competition } = defineProps<Props>();

const modal = useModal()!;

// We don't want to close the modal after they've uploaded a header since they can set a crop
// after. We want to auto-close it after they've saved the crop, though.
const previousHeaderId = ref<number | null>(competition.header?.id || null);

function onSubmit(inputCompetition: CommunityCompetitionModel) {
	const newHeaderId = (inputCompetition.header && inputCompetition.header.id) || null;
	if (previousHeaderId.value === newHeaderId) {
		modal.resolve(competition);
	}
	previousHeaderId.value = newHeaderId;
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<FormCommunityCompetitionHeader :model="competition" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
