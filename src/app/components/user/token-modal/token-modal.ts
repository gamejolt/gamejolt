import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { Translate } from '../../../../_common/translate/translate.service';
import FormToken from '../../forms/token/token.vue';

@Options({
	components: {
		AppLoading,
		AppExpand,
		FormToken,
	},
})
export default class AppUserTokenModal extends BaseModal {
	token = '';
	isChanging = false;

	async created() {
		try {
			const response = await Api.sendRequest('/web/dash/token');
			this.token = response.token;
		} catch (e) {
			showErrorGrowl(Translate.$gettext(`Couldn't get your token.`));
		}
	}

	showChangeForm() {
		this.isChanging = true;
	}

	onTokenChanged(formModel: { token: string }) {
		this.isChanging = false;
		this.token = formModel.token;
	}
}
