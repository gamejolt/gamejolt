import { Component, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Growls } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FormModel } from '../../forms/fireside/add/add';
import FormFiresideAdd from '../../forms/fireside/add/add.vue';

@Component({
	components: {
		FormFiresideAdd,
		AppLoading,
	},
})
export default class AppFiresideAddModal extends BaseModal {
	@Prop({ type: Community, required: false, default: undefined }) community!:
		| Community
		| undefined;

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
				Growls.error(
					this.$gettext(
						`Cannot create a new Fireside... yet. Try again in a couple minutes.`
					)
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
		Growls.error(
			this.$gettext(`Couldn't create your fireside. Reload the page and try again.`)
		);
	}
}
