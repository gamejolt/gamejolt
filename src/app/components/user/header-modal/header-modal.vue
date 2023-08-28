<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';
import { useCommonStore } from '../../../../_common/store/common-store';
import { UserModel } from '../../../../_common/user/user.model';
import FormUserHeader from '../../forms/user-header/header.vue';

@Options({
	components: {
		FormUserHeader,
	},
})
export default class AppUserHeaderModal extends mixins(BaseModal) {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.app.user && this.app.user.header_media_item) {
			this.previousHeaderId = this.app.user.header_media_item.id;
		}
	}

	onSubmit(user: UserModel) {
		const newHeaderId = (user.header_media_item && user.header_media_item.id) || null;
		if (this.previousHeaderId === newHeaderId) {
			this.modal.resolve(user);
		}
		this.previousHeaderId = newHeaderId;
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
			<FormUserHeader :model="app.user" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
