<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelChangeUrl from '../../../forms/community/channel/change-url/change-url.vue';

@Options({
	components: {
		FormCommunityChannelChangeUrl,
	},
})
export default class AppCommunityChannelChangeUrlModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) channel!: CommunityChannel;
	@Prop({ type: Object, required: true }) community!: Community;
	@Prop({ type: Array, required: true }) channels!: CommunityChannel[];

	onSubmit(channel: CommunityChannel) {
		return this.modal.resolve(channel);
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
		<div class="modal-header">
			<h2 class="modal-title">
				<translate>Change Channel URL</translate>
			</h2>
		</div>
		<div class="modal-body">
			<form-community-channel-change-url
				:model="channel"
				:community="community"
				:channels="channels"
				@submit="onSubmit"
			/>
		</div>
	</app-modal>
</template>
