import View from '!view!./profile.html';
import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { AppFormControlContent } from 'game-jolt-frontend-lib/components/form-vue/control/content/content';
import { Component } from 'vue-property-decorator';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppFormControlTheme } from '../../../../lib/gj-lib-client/components/form-vue/control/theme/theme';
import { AppFormControlToggle } from '../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmitError,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Theme } from '../../../../lib/gj-lib-client/components/theme/theme.model';
import {
	ThemeMutation,
	ThemeStore,
} from '../../../../lib/gj-lib-client/components/theme/theme.store';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';

@View
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
export class FormProfile extends BaseForm<User> implements FormOnLoad, FormOnSubmitError {
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
