import * as distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFormControlMarkdown from 'game-jolt-frontend-lib/components/form-vue/control/markdown/markdown.vue';
import AppFormControlTheme from 'game-jolt-frontend-lib/components/form-vue/control/theme/theme.vue';
import AppFormControlToggle from 'game-jolt-frontend-lib/components/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnLoad, FormOnSubmitError } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Theme } from 'game-jolt-frontend-lib/components/theme/theme.model';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { Component } from 'vue-property-decorator';

@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		AppFormControlMarkdown,
		AppFormControlTheme,
		AppFormControlToggle,
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
