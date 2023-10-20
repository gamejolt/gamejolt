<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import {
	CommunityModel,
	CommunityPresetChannelType,
	getCommunityChannelBackground,
} from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelPresetBackground from '../../../forms/community/channel/preset-background/preset-background.vue';

@Options({
	components: {
		FormCommunityChannelPresetBackground,
	},
})
export default class AppCommunityChannelPresetBackgroundModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: String, required: true }) presetType!: CommunityPresetChannelType;

	previousBackgroundId: number | null = null;

	created() {
		const background = getCommunityChannelBackground(this.community, this.presetType);
		if (background) {
			this.previousBackgroundId = background.id;
		}
	}

	onSubmit(community: CommunityModel) {
		const background = getCommunityChannelBackground(community, this.presetType);
		const newBackgroundId = (background && background.id) || null;

		if (this.previousBackgroundId === newBackgroundId) {
			this.modal.resolve(this.community);
		}
		this.previousBackgroundId = newBackgroundId;
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
			<FormCommunityChannelPresetBackground
				:model="community"
				:preset-type="presetType"
				@submit="onSubmit"
			/>
		</div>
	</AppModal>
</template>
