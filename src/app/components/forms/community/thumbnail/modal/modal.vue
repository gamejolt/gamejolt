<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../../_common/modal/base';
import FormCommunityThumbnail from '../thumbnail.vue';

@Options({
	components: {
		FormCommunityThumbnail,
	},
})
export default class AppCommunityThumbnailModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) community!: CommunityModel;

	// We don't want to close the modal after they've uploaded a thumbnail since they can set a crop
	// after. We want to auto-close it after they've saved the crop, though.
	previousThumbnailId: number | null = null;

	created() {
		if (this.community.thumbnail) {
			this.previousThumbnailId = this.community.thumbnail.id;
		}
	}

	onSubmit(community: CommunityModel) {
		const newThumbnailId = (community.thumbnail && community.thumbnail.id) || null;
		if (this.previousThumbnailId === newThumbnailId) {
			this.modal.resolve(this.community);
		}
		this.previousThumbnailId = newThumbnailId;
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
			<FormCommunityThumbnail :model="community" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
