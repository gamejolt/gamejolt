<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import FormCommunityChannelChangeUrl from '../../../forms/community/channel/change-url/change-url.vue';

@Options({
	components: {
		FormCommunityChannelChangeUrl,
	},
})
export default class AppCommunityChannelChangeUrlModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) channel!: CommunityChannelModel;
	@Prop({ type: Object, required: true }) community!: CommunityModel;
	@Prop({ type: Array, required: true }) channels!: CommunityChannelModel[];

	onSubmit(channel: CommunityChannelModel) {
		return this.modal.resolve(channel);
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
		<div class="modal-header">
			<h2 class="modal-title">
				<AppTranslate>Change Channel URL</AppTranslate>
			</h2>
		</div>
		<div class="modal-body">
			<FormCommunityChannelChangeUrl
				:model="channel"
				:community="community"
				:channels="channels"
				@submit="onSubmit"
			/>
		</div>
	</AppModal>
</template>
