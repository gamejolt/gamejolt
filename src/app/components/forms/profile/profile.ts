import { Component } from 'vue-property-decorator';
import * as View from '!view!./profile.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import {
	FormOnInit,
	BaseForm,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import {
	Environment,
} from '../../../../lib/gj-lib-client/components/environment/environment.service';
import {
	AppLoading,
} from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import {
	AppExpand,
} from '../../../../lib/gj-lib-client/components/expand/expand';
import {
	AppJolticon,
} from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import {
	AppFormControlMarkdown,
} from '../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		AppFormControlMarkdown,
	},
})
export class FormProfile extends BaseForm<User> implements FormOnInit {
	modelClass = User;
	resetOnSubmit = true;

	isLoaded = false;
	usernameChangedOn = 0;
	usernameTimeLeft = 0;
	nameChangedOn = 0;
	nameTimeLeft = 0;

	Environment = Environment;

	async onInit() {
		const payload = await Api.sendRequest('/web/dash/profile/save');
		console.log(payload);

		this.isLoaded = true;
		this.usernameChangedOn = payload.usernameChangedOn;
		this.usernameTimeLeft = payload.usernameTimeLeft;
		this.nameChangedOn = payload.nameChangedOn;
		this.nameTimeLeft = payload.nameTimeLeft;

		this.formModel.assign(payload.user);

		// TODO
		// if ( scope.usernameTimeLeft ) {
		// 	scope.usernameDuration = moment.duration( scope.usernameTimeLeft ).humanize();
		// }

		// if ( scope.nameTimeLeft ) {
		// 	scope.nameDuration = moment.duration( scope.nameTimeLeft ).humanize();
		// }
	}
}
