import { Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Growls } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import FormFiresideAdd from '../../forms/fireside/add/add.vue';

@Options({
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

	get defaultTitle() {
		return this.nameSuggestion ?? undefined;
	}

	get requestUri() {
		let requestUri = `/web/dash/fireside/add`;
		if (this.community) {
			requestUri += '?community_id=' + this.community.id;
		}
		return requestUri;
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

		this.isLoading = false;
	}

	async onSubmit(formData: any) {
		const title = formData.title;
		const isDraft = formData.is_draft;
		const payload = await Api.sendRequest(this.requestUri, { title, is_draft: isDraft });

		if (!payload.success) {
			console.log(payload);
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
			this.$gettext(`Couldn't created your Fireside. Reload the page and try again.`)
		);
	}
}
