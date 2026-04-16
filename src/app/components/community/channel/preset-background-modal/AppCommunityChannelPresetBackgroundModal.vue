<script lang="ts" setup>
import { ref } from 'vue';

import FormCommunityChannelPresetBackground from '~app/components/forms/community/channel/preset-background/FormCommunityChannelPresetBackground.vue';
import AppButton from '~common/button/AppButton.vue';
import {
	CommunityModel,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '~common/community/community.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	community: CommunityModel;
	presetType: CommunityPresetChannelType;
};
const { community, presetType } = defineProps<Props>();

const modal = useModal()!;

const background = getCommunityChannelBackground(community, presetType);
const previousBackgroundId = ref(background?.id || null);

function onSubmit(inputCommunity: CommunityModel) {
	const background = getCommunityChannelBackground(inputCommunity, presetType);
	const newBackgroundId = (background && background.id) || null;

	if (previousBackgroundId.value === newBackgroundId) {
		modal.resolve(community);
	}
	previousBackgroundId.value = newBackgroundId;
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
			<FormCommunityChannelPresetBackground
				:model="community"
				:preset-type="presetType"
				@submit="onSubmit"
			/>
		</div>
	</AppModal>
</template>
