<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelBackground from '../../../forms/community/channel/background/background.vue';

@Options({
	components: {
		FormCommunityChannelBackground,
	},
})
export default class AppCommunityChannelBackgroundModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) channel!: CommunityChannel;

	previousBackgroundId: number | null = null;

	created() {
		if (this.channel.background) {
			this.previousBackgroundId = this.channel.background.id;
		}
	}

	onSubmit(channel: CommunityChannel) {
		const newBackgroundId = (channel.background && channel.background.id) || null;
		if (this.previousBackgroundId === newBackgroundId) {
			this.modal.resolve(this.channel);
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
			<form-community-channel-background :model="channel" @submit="onSubmit" />
		</div>
	</app-modal>
</template>
