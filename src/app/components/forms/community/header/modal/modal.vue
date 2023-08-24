<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../../_common/modal/base';
import FormCommunityHeader from '../header.vue';

@Options({
	components: {
		FormCommunityHeader,
	},
})
export default class AppCommunityHeaderModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) community!: CommunityModel;

	// We don't want to close the modal after they've uploaded a header since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousHeaderId: number | null = null;

	created() {
		if (this.community.header) {
			this.previousHeaderId = this.community.header.id;
		}
	}

	onSubmit(community: CommunityModel) {
		const newHeaderId = community.header ? community.header.id : null;
		if (!newHeaderId || this.previousHeaderId === newHeaderId) {
			this.modal.resolve(this.community);
			return;
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
			<FormCommunityHeader :model="community" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
