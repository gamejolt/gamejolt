<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import { useCommonStore } from '../../../../_common/store/common-store';
import FormAvatar from '../../forms/avatar/avatar.vue';

@Options({
	components: {
		FormAvatar,
	},
})
export default class AppUserAvatarModal extends mixins(BaseModal) {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}
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
			<FormAvatar :model="app.user" />
		</div>
	</AppModal>
</template>
