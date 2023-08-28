<script lang="ts">
import { setup } from 'vue-class-component';
import { mixins, Options, Prop } from 'vue-property-decorator';
import { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { BaseModal } from '../../../../../_common/modal/base';
import { getDatalistOptions } from '../../../../../_common/settings/datalist-options.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { REASON_OTHER } from '../../../../../_common/user/action-reasons';
import FormCommunityEjectPost, { FormModel } from '../form/form.vue';
import { CommunityEjectPostModalResult } from './modal.service';

@Options({
	components: {
		FormCommunityEjectPost,
	},
})
export default class AppCommunityEjectPostModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) firesidePostCommunity!: FiresidePostCommunityModel;
	@Prop({ type: Object, required: true }) post!: FiresidePostModel;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	reasonFormModel: FormModel | null = null;

	get shouldShowForm() {
		// Do not show the form when the logged in user is the author of the post.
		// It does not make sense to let them notify themselves.
		return this.post.user.id !== this.user!.id;
	}

	created() {
		// Create a default form model, because the form will not show when a post author moves
		// their own post.
		this.reasonFormModel = {
			notifyUser: 'no',
			reason: null,
			reasonType: null,
		};
	}

	onChangeForm(formModel: FormModel) {
		this.reasonFormModel = formModel;
	}

	onEject() {
		if (this.reasonFormModel === null) {
			return;
		}

		const notifyUser = this.reasonFormModel.notifyUser !== 'no';
		const hasReason = notifyUser && this.reasonFormModel.notifyUser === 'yes-reason';

		const result = {
			notifyUser,
			reason: hasReason ? this.reasonFormModel.reason : null,
			reasonType: hasReason ? this.reasonFormModel.reasonType : null,
		} as CommunityEjectPostModalResult;

		// Add custom options entry to list of options.
		if (result.reasonType === REASON_OTHER && result.reason) {
			const options = getDatalistOptions(
				'community-eject',
				this.firesidePostCommunity.community.id.toString()
			);
			options.unshiftItem(result.reason);
		}

		this.modal.resolve(result);
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
				<AppTranslate>Eject</AppTranslate>
			</AppButton>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
.-title
	font-weight: normal
</style>
