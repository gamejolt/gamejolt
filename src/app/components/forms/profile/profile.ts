import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { Component } from 'vue-property-decorator';
import View from '!view!./profile.html';

import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import {
	FormOnLoad,
	BaseForm,
	FormOnSubmitError,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppFormControlMarkdown } from '../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppFormControlTheme } from '../../../../lib/gj-lib-client/components/form-vue/control/theme/theme';
import {
	ThemeMutation,
	ThemeStore,
} from '../../../../lib/gj-lib-client/components/theme/theme.store';

@View
@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		AppFormControlMarkdown,
		AppFormControlTheme,
	},
})
export class FormProfile extends BaseForm<User> implements FormOnLoad, FormOnSubmitError {
	modelClass = User;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@ThemeMutation setFormTheme: ThemeStore['setFormTheme'];

	usernameChangedOn = 0;
	usernameTimeLeft = 0;
	usernameDuration = '';
	isBioLocked = false;

	Environment = Environment;

	get loadUrl() {
		return '/web/dash/profile/save';
	}

	destroyed() {
		this.setFormTheme(null);
	}

	onLoad(payload: any) {
		this.usernameChangedOn = payload.usernameChangedOn;
		this.usernameTimeLeft = payload.usernameTimeLeft;

		if (this.usernameTimeLeft) {
			this.usernameDuration = distanceInWordsToNow(Date.now() + this.usernameTimeLeft);
		}

		this.isBioLocked = payload.isBioLocked;
	}

	onSubmitError(response: any) {
		if (response.errors && response.errors['bio-locked']) {
			this.isBioLocked = true;
		}
	}

	onThemeChanged() {
		this.setFormTheme(this.formModel.theme || null);
	}
}
