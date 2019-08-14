import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFormControlContent from '../../../../_common/form-vue/control/content/content.vue';
import AppFormControlTheme from '../../../../_common/form-vue/control/theme/theme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnLoad, FormOnSubmitError } from '../../../../_common/form-vue/form.service';
import { Theme } from '../../../../_common/theme/theme.model';
import { ThemeMutation, ThemeStore } from '../../../../_common/theme/theme.store';
import { User } from '../../../../_common/user/user.model';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Component } from 'vue-property-decorator';

@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		AppFormControlTheme,
		AppFormControlToggle,
		AppFormControlContent,
	},
})
export default class FormProfile extends BaseForm<User> implements FormOnLoad, FormOnSubmitError {
	modelClass = User;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

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
		// Default would be the default theme for site.
		this.setFormTheme(this.formModel.theme || new Theme());
	}
}
