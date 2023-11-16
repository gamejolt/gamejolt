<script lang="ts" setup>
import { PropType } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { CommunityChannelModel } from '../../../../../_common/community/channel/channel.model';
import { CommunityModel } from '../../../../../_common/community/community.model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppCommunityRemoveChannel from '../AppCommunityRemoveChannel.vue';

defineProps({
	community: {
		type: Object as PropType<CommunityModel>,
		required: true,
	},
	channel: {
		type: Object as PropType<CommunityChannelModel>,
		required: true,
	},
});

const modal = useModal()!;

function onRemoved(postsMovedTo?: CommunityChannelModel) {
	modal.resolve(postsMovedTo || null);
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title">
				{{ $gettext(`Remove "%{ title }" channel?`, { title: channel.title }) }}
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="channel.type === 'competition'">
				<div class="alert">
					<h4 class="sans-margin-top">
						{{ $gettext(`Removing a Jam Channel`) }}
					</h4>
					<p>
						<span v-translate>
							This channel contains a <b>Jam</b>, which gets removed when this channel
							gets removed. That includes all entries, votes, awards and results that
							belong to the jam.
						</span>
					</p>
					<p>
						<span class="-jam-warning">
							<b>{{ $gettext(`This action is irreversible!`) }}</b>
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
