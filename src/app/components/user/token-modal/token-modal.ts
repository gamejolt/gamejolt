import { Component } from 'vue-property-decorator';
import View from '!view!./token-modal.html';

import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Translate } from '../../../../lib/gj-lib-client/components/translate/translate.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { FormToken } from '../../forms/token/token';

@View
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
