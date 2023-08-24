<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppCommunityRemoveChannel from '../remove-channel.vue';

@Options({
	components: {
		AppCommunityRemoveChannel,
	},
})
export default class AppCommunityRemoveChannelModal extends mixins(BaseModal) {
	@Prop(Object)
	community!: CommunityModel;

	@Prop(Object)
	channel!: CommunityChannelModel;

	onRemoved(postsMovedTo?: CommunityChannelModel) {
		this.modal.resolve(postsMovedTo || null);
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
				<AppTranslate :translate-params="{ title: channel.title }">
					Remove "%{ title }" channel?
				</AppTranslate>
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="channel.type === 'competition'">
				<div class="alert">
					<h4 class="sans-margin-top">
						<AppTranslate>Removing a Jam Channel</AppTranslate>
					</h4>
					<p>
						<span v-translate>
							This channel contains a <b>Jam</b>, which gets removed when this channel
							gets removed. That includes all entries, votes, awards and results that
							belong to the jam.
						</span>
					</p>
					<p>
						<span v-translate class="-jam-warning">
							<b>This action is irreversible!</b>
						</span>
					</p>
				</div>
			</template>

			<AppCommunityRemoveChannel
				:community="community"
				:channel="channel"
				@removed="onRemoved"
			/>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-jam-warning
	display: inline-block
	padding: 4px
	rounded-corners()
	background-color: var(--theme-notice)
	color: var(--theme-notice-fg)
	margin-top: 4px
</style>
