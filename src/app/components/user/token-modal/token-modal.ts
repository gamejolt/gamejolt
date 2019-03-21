import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
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
