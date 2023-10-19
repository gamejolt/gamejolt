<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import {
	CommunityModel,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../_common/community/community.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormCommunityChannelPresetBackground from '../../../forms/community/channel/preset-background/preset-background.vue';

const props = defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	presetType: {
		type: String as PropType<CommunityPresetChannelType>,
		required: true,
	},
});

const { community, presetType } = toRefs(props);

const modal = useModal()!;
const previousBackgroundId = ref<number | null>(null);

const background = getCommunityChannelBackground(community.value, presetType.value);
if (background) {
	previousBackgroundId.value = background.id;
}

function onSubmit(inputCommunity: CommunityModel) {
	const background = getCommunityChannelBackground(inputCommunity, presetType.value);
	const newBackgroundId = (background && background.id) || null;

	if (previousBackgroundId.value === newBackgroundId) {
		modal.resolve(community.value);
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
