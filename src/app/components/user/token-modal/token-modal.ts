import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import { Growls } from '../../../../_common/growls/growls.service';
import { BaseModal } from '../../../../_common/modal/base';
import { Translate } from '../../../../_common/translate/translate.service';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Component } from 'vue-property-decorator';
import FormToken from '../../forms/token/token.vue';

@Component({
	components: {
		AppJolticon,
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
			Growls.error(Translate.$gettext(`Couldn't get your token.`));
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
