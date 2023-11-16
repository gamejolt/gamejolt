<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityCompetitionModel } from '../../../../../_common/community/competition/competition.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormCommunityCompetitionHeader from '../../../forms/community/competition/header/header.vue';

const props = defineProps({
	competition: {
		type: Object as PropType<CommunityCompetitionModel>,
		required: true,
	},
});

const { competition } = toRefs(props);
const modal = useModal()!;

// We don't want to close the modal after they've uploaded a header since they can set a crop
// after. We want to auto-close it after they've saved the crop, though.
const previousHeaderId = ref<number | null>(competition.value.header?.id || null);

function onSubmit(inputCompetition: CommunityCompetitionModel) {
	const newHeaderId = (inputCompetition.header && inputCompetition.header.id) || null;
	if (previousHeaderId.value === newHeaderId) {
		modal.resolve(competition.value);
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
