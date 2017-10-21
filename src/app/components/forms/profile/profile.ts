import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { Component } from 'vue-property-decorator';
import View from '!view!./profile.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import {
	FormOnLoad,
	BaseForm,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlMarkdown } from '../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';

@View
@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		AppFormControlMarkdown,
	},
})
export class FormProfile extends BaseForm<User> implements FormOnLoad {
	modelClass = User;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	usernameChangedOn = 0;
	usernameTimeLeft = 0;
	usernameDuration = '';
	nameChangedOn = 0;
	nameTimeLeft = 0;
	nameDuration = '';

	Environment = Environment;

	get loadUrl() {
		return '/web/dash/profile/save';
	}

	onLoad(payload: any) {
		this.usernameChangedOn = payload.usernameChangedOn;
		this.usernameTimeLeft = payload.usernameTimeLeft;
		this.nameChangedOn = payload.nameChangedOn;
		this.nameTimeLeft = payload.nameTimeLeft;

		this.formModel.assign(payload.user);

		if (this.usernameTimeLeft) {
			this.usernameDuration = distanceInWordsToNow(Date.now() + this.usernameTimeLeft);
		}

		if (this.nameTimeLeft) {
			this.nameDuration = distanceInWordsToNow(Date.now() + this.nameTimeLeft);
		}
	}
}
