<script lang="ts" setup>
import { PropType, ref, toRef, toRefs } from 'vue';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { REASON_OTHER } from '../../../../../_common/user/action-reasons';
import FormCommunityEjectPost, { FormModel } from '../form/form.vue';
import { CommunityEjectPostModalResult } from './modal.service';

const props = defineProps({
	firesidePostCommunity: {
		type: Object as PropType<FiresidePostCommunityModel>,
		required: true,
	},
	post: {
		type: Object as PropType<FiresidePostModel>,
		required: true,
	},
});

const { firesidePostCommunity, post } = toRefs(props);

const { user } = useCommonStore();
const modal = useModal()!;
const reasonFormModel = ref<FormModel | null>(null);

// Do not show the form when the logged in user is the author of the post.
// It does not make sense to let them notify themselves.
const shouldShowForm = toRef(() => post.value.user.id !== user.value!.id);

reasonFormModel.value = {
	notifyUser: 'no',
	reason: null,
	reasonType: null,
};

function onChangeForm(formModel: FormModel) {
	reasonFormModel.value = formModel;
}

function onEject() {
	if (reasonFormModel.value === null) {
		return;
	}

	const notifyUser = reasonFormModel.value.notifyUser !== 'no';
	const hasReason = notifyUser && reasonFormModel.value.notifyUser === 'yes-reason';

	const result = {
		notifyUser,
		reason: hasReason ? reasonFormModel.value.reason : null,
		reasonType: hasReason ? reasonFormModel.value.reasonType : null,
	} as CommunityEjectPostModalResult;

	// Add custom options entry to list of options.
	if (result.reasonType === REASON_OTHER && result.reason) {
		const options = getDatalistOptions(
			'community-eject',
			firesidePostCommunity.value.community.id.toString()
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
				<span v-translate="{ communityName: firesidePostCommunity.community.name }">
					Eject post from %{ communityName }?
				</span>
			</h2>
		</div>
		<div class="modal-body">
			<FormCommunityEjectPost
				v-if="shouldShowForm"
				:community="firesidePostCommunity.community"
				@change="onChangeForm"
			/>

			<AppButton primary icon="eject" @click="onEject">
				{{ $gettext(`Eject`) }}
			</AppButton>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-title
	font-weight: normal
</style>
