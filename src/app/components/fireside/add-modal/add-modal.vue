<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FormModel } from '../../forms/fireside/add/add';
import FormFiresideAdd from '../../forms/fireside/add/add.vue';

@Options({
	components: {
		FormFiresideAdd,
		AppLoading,
	},
})
export default class AppFiresideAddModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: false })
	community?: Community;

	isLoading = true;
	nameSuggestion: string | null = null;
	communities: Community[] = [];

	get defaultTitle() {
		return this.nameSuggestion ?? undefined;
	}

	get requestUri() {
		return `/web/dash/fireside/add`;
	}

	async mounted() {
		const payload = await Api.sendRequest(this.requestUri);

		// If there is already an active fireside for the requested target, return it immediately.
		if (payload.fireside) {
			const fireside = new Fireside(payload.fireside);
			this.modal.resolve(fireside);
			return;
		}

		if (payload.nameSuggestion) {
			this.nameSuggestion = payload.nameSuggestion;
		}

		if (payload.targetableCommunities) {
			this.communities = Community.populate(payload.targetableCommunities);
		} else {
			this.communities = [];
		}

		this.isLoading = false;
	}

	async onSubmit(formData: FormModel) {
		const payloadData = {
			title: formData.title,
			is_draft: formData.is_draft,
		} as any;
		if (formData.community_id) {
			payloadData['community_id'] = formData.community_id;
			payloadData['auto_feature'] = formData.auto_feature;
			payloadData['add_community_as_cohosts'] = formData.add_community_as_cohosts;
		}

		const payload = await Api.sendRequest(this.requestUri, payloadData);

		if (!payload.success) {
			if (payload.errors && payload.errors['rate-limit']) {
				showErrorGrowl(
					this.$gettext(`You must wait a few minutes before creating another fireside.`)
				);
				return;
			}

			this.showGenericError();
			return;
		}

		if (!payload.fireside) {
			this.showGenericError();
			return;
		}

		const fireside = new Fireside(payload.fireside);
		this.modal.resolve(fireside);
	}

	private showGenericError() {
		showErrorGrowl(this.$gettext(`Couldn't create your fireside. Reload and try again.`));
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
			<p class="lead">
				<AppTranslate>
					Firesides are temporary pop-up rooms where you can chat and stream with your
					friends, followers, and communities!
				</AppTranslate>
			</p>

			<AppLoading v-if="isLoading" centered />
			<FormFiresideAdd
				v-else
				:community="community"
				:default-title="defaultTitle"
				:communities="communities"
				@submit="onSubmit"
			/>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped></style>
