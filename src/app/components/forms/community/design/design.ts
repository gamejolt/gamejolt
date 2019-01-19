import View from '!view!./design.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppEditableOverlay } from 'game-jolt-frontend-lib/components/editable-overlay/editable-overlay';
import { AppFormControlTheme } from 'game-jolt-frontend-lib/components/form-vue/control/theme/theme';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Theme } from 'game-jolt-frontend-lib/components/theme/theme.model';
import {
	ThemeMutation,
	ThemeState,
	ThemeStore,
} from 'game-jolt-frontend-lib/components/theme/theme.store';
import { Component } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppFormControlTheme,
		AppEditableOverlay,
	},
})
export class FormCommunityDesign extends BaseForm<Community> {
	modelClass = Community as any;
	saveMethod: '$saveDesign' = '$saveDesign';

	@ThemeState
	userTheme!: ThemeStore['userTheme'];

	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

	get hasPerms() {
		return this.formModel.hasPerms('media');
	}

	destroyed() {
		this.setFormTheme(null);
	}

	onThemeChanged() {
		// Default theme would be the user theme. Don't want to fallback to page theme otherwise
		// when clearing theme it'll show the page theme.
		this.setFormTheme(this.formModel.theme || this.userTheme || new Theme());
	}
}
