<script lang="ts" setup>
import { ref } from 'vue';

import FormCommunityChannelBackground from '~app/components/forms/community/channel/background/FormCommunityChannelBackground.vue';
import AppButton from '~common/button/AppButton.vue';
import { CommunityChannelModel } from '~common/community/channel/channel.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	channel: CommunityChannelModel;
};
const { channel } = defineProps<Props>();

const modal = useModal()!;

const previousBackgroundId = ref(channel.background?.id || null);

function onSubmit(channel: CommunityChannelModel) {
	const newBackgroundId = (channel.background && channel.background.id) || null;
	if (previousBackgroundId.value === newBackgroundId) {
		modal.resolve(channel);
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
			<FormCommunityChannelBackground :model="channel" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
