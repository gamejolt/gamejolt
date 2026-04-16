<script lang="ts" setup>
import FormAvatar from '~app/components/forms/avatar/FormAvatar.vue';
import AppButton from '~common/button/AppButton.vue';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { useCommonStore } from '~common/store/common-store';
import FormUserAvatarFrame from '~common/user/user-avatar/frame/FormUserAvatarFrame.vue';

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
			<FormAvatar :model="user ?? undefined" />

			<label class="control-label">
				{{ $gettext(`Avatar frames`) }}
			</label>
			<FormUserAvatarFrame />
		</div>
	</AppModal>
</template>
