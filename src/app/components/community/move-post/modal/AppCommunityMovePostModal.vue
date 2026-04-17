<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import FormCommunityMovePost, {
	MovePostFormModel as FormModel,
} from '~app/components/community/move-post/form/FormCommunityMovePost.vue';
import { CommunityMovePostModalResult } from '~app/components/community/move-post/modal/modal.service';
import AppButton from '~common/button/AppButton.vue';
import AppCommunityChannelSelect from '~common/community/channel/AppCommunityChannelSelect.vue';
import { CommunityChannelModel } from '~common/community/channel/channel.model';
import { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import { getDatalistOptions } from '~common/settings/datalist-options.service';
import { useCommonStore } from '~common/store/common-store';
import { $gettext } from '~common/translate/translate.service';
import { REASON_OTHER } from '~common/user/action-reasons';

type Props = {
	firesidePostCommunity: FiresidePostCommunityModel;
	post: FiresidePostModel;
	channels: CommunityChannelModel[];
};
const { firesidePostCommunity, post, channels } = defineProps<Props>();

const { user } = useCommonStore();
const modal = useModal()!;

const selectedChannel = ref<CommunityChannelModel | undefined>(undefined);
const reasonFormModel = ref<FormModel | null>(null);

const selectableChannels = computed(() => {
	if (!firesidePostCommunity.channel) {
		return channels;
	}

	return channels.filter(i => i.id !== firesidePostCommunity.channel!.id);
});

const hasSelectedChannel = toRef(() => selectedChannel.value instanceof CommunityChannelModel);

// More than 1, since the post can't be moved to the channel it's already in.
const canMove = toRef(() => channels.length > 1);

// Do not show the form when the logged in user is the author of the post.
// It does not make sense to let them notify themselves.
const shouldShowForm = toRef(() => post.user.id !== user.value!.id);

// Create a default form model, because the form will not show when a post author moves
// their own post.
reasonFormModel.value = {
	notifyUser: 'no',
	reason: null,
	reasonType: null,
};

function onChangeForm(formModel: FormModel) {
	reasonFormModel.value = formModel;
}

function onMove() {
	if (selectedChannel.value === undefined || reasonFormModel.value === null) {
		return;
	}

	const notifyUser = reasonFormModel.value.notifyUser !== 'no';
	const hasReason = notifyUser && reasonFormModel.value.notifyUser === 'yes-reason';

	const result = {
		channel: selectedChannel.value,
		notifyUser,
		reason: hasReason ? reasonFormModel.value.reason : null,
		reasonType: hasReason ? reasonFormModel.value.reasonType : null,
	} as CommunityMovePostModalResult;

	// Add custom options entry to list of options.
	if (result.reasonType === REASON_OTHER && result.reason) {
		const options = getDatalistOptions(
			'community-move-post',
			firesidePostCommunity.community.id.toString()
		);
		options.unshiftItem(result.reason);
	}

	modal.resolve(result);
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
				{{ $gettext(`Which channel to move to?`) }}
			</h2>
		</div>

		<div class="modal-body">
			<template v-if="canMove">
				<AppCommunityChannelSelect
					v-model="selectedChannel"
					class="-channel-select"
					:channels="selectableChannels"
				/>

				<FormCommunityMovePost
					v-if="shouldShowForm"
					:community="firesidePostCommunity.community"
					@change="onChangeForm"
				/>

				<AppButton
					primary
					icon="arrow-forward"
					:disabled="!hasSelectedChannel"
					@click="onMove"
				>
					{{ $gettext(`Move`) }}
				</AppButton>
			</template>
			<span v-else>
				{{
					$gettext(
						`There are no channels in this community that the post can be moved to.`
					)
				}}
			</span>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-channel-select
	margin-bottom: $line-height-computed
</style>
