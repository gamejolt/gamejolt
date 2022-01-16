<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import {
	Community,
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
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: String, required: true }) presetType!: CommunityPresetChannelType;

	previousBackgroundId: number | null = null;

	created() {
		const background = getCommunityChannelBackground(this.community, this.presetType);
		if (background) {
			this.previousBackgroundId = background.id;
		}
	}

	onSubmit(community: Community) {
		const background = getCommunityChannelBackground(community, this.presetType);
		const newBackgroundId = (background && background.id) || null;

		console.log('previous', this.previousBackgroundId, 'new', newBackgroundId);

		if (this.previousBackgroundId === newBackgroundId) {
			this.modal.resolve(this.community);
		}
		this.previousBackgroundId = newBackgroundId;
	}
}
</script>

<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>
		<div class="modal-body">
			<form-community-channel-preset-background
				:model="community"
				:preset-type="presetType"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>
