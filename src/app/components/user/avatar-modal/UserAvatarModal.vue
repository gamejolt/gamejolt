<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { run } from '../../../../utils/utils';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import FormUserAvatarFrame from '../../../../_common/user/user-avatar/frame/FormUserAvatarFrame.vue';
import FormAvatar from '../../forms/avatar/avatar.vue';

const modal = useModal()!;
const { user } = useCommonStore();

const hasAvatarFrameSelector = ref(false);

onMounted(() => {
	run(async () => {
		const response = await Api.sendFieldsRequest(
			`/mobile/feature`,
			{ avatar_frames: true },
			{ detach: true }
		);

		hasAvatarFrameSelector.value = response.avatar_frames === true;
	});
});
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<FormAvatar :model="user" />

			<template v-if="hasAvatarFrameSelector">
				<label class="control-label">
					{{ $gettext(`Avatar frames`) }}
				</label>
				<FormUserAvatarFrame />
			</template>
		</div>
	</AppModal>
</template>
