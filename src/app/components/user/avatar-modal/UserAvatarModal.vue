<script lang="ts" setup>
import AppButton from '../../../../_common/button/AppButton.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import FormUserAvatarFrame from '../../../../_common/user/user-avatar/frame/FormUserAvatarFrame.vue';
import FormAvatar from '../../forms/avatar/avatar.vue';

const modal = useModal()!;
const { user } = useCommonStore();
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

			<label class="control-label">
				{{ $gettext(`Avatar frames`) }}
			</label>
			<FormUserAvatarFrame />
		</div>
	</AppModal>
</template>
