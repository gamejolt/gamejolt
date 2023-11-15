<script lang="ts" setup>
import { PropType, ref, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormCommunityChannelBackground from '../../../forms/community/channel/background/background.vue';

const props = defineProps({
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		required: true,
	},
});

const { channel } = toRefs(props);
const modal = useModal()!;

const previousBackgroundId = ref(channel.value.background?.id || null);

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
