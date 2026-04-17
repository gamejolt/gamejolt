<script lang="ts" setup>
import AppCommunityRemoveChannel from '~app/components/community/remove-channel/AppCommunityRemoveChannel.vue';
import AppButton from '~common/button/AppButton.vue';
import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { CommunityModel } from '~common/community/community.model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	community: CommunityModel;
	channel: CommunityChannelModel;
};
defineProps<Props>();

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
						<AppTranslate>
							This channel contains a Jam, which gets removed when this channel gets
							removed. That includes all entries, votes, awards and results that
							belong to the jam.
						</AppTranslate>
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
