import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { BaseForm, FormOnSubmit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { Component } from 'vue-property-decorator';


@Component({
	components: {
		AppJolticon,
	},
})
export default class FormRetrieveLogin extends BaseForm<any> implements FormOnSubmit {
	warnOnDiscard = false;

	readonly Connection = Connection;

	onChanged() {
		this.setState('invalidEmail', false);
	}

	async onSubmit() {
		const response = await Api.sendRequest('/web/auth/retrieve', this.formModel);

		if (response.success === false) {
			if (response.reason && response.reason === 'invalid-email') {
				this.setState('invalidEmail', true);
			}
		}

		return response;
	}
}
