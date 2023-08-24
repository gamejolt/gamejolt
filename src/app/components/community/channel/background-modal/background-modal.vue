<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelBackground from '../../../forms/community/channel/background/background.vue';

@Options({
	components: {
		FormCommunityChannelBackground,
	},
})
export default class AppCommunityChannelBackgroundModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) channel!: CommunityChannelModel;

	previousBackgroundId: number | null = null;

	created() {
		if (this.channel.background) {
			this.previousBackgroundId = this.channel.background.id;
		}
	}

	onSubmit(channel: CommunityChannelModel) {
		const newBackgroundId = (channel.background && channel.background.id) || null;
		if (this.previousBackgroundId === newBackgroundId) {
			this.modal.resolve(this.channel);
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
			<FormCommunityChannelBackground :model="channel" @submit="onSubmit" />
		</div>
	</AppModal>
</template>
