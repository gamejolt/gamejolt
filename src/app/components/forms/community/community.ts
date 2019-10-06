import { Component } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import AppFormControlTheme from '../../../../_common/form-vue/control/theme/theme.vue';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import { Theme } from '../../../../_common/theme/theme.model';
import { ThemeMutation, ThemeState, ThemeStore } from '../../../../_common/theme/theme.store';
import { Store } from '../../../store';

@Component({
	components: {
		AppFormControlTheme,
	},
})
export default class FormCommunity extends BaseForm<Community> implements FormOnSubmitSuccess {
	modelClass = Community;
	warnOnDiscard = false;

	@Action
	joinCommunity!: Store['joinCommunity'];

	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

	@ThemeState
	userTheme!: ThemeStore['userTheme'];

	onSubmitSuccess(response: any) {
		const community = new Community(response.community);

		// When creating a community you get auto joined to it,
		// but aside from the actual join operation we also do other things
		// in this store action so we gotta call it anyways.
		this.joinCommunity(community);

		this.$router.push(community.routeEditLocation);
	}

	onThemeChanged() {
		// Default theme would be the user theme. Don't want to fallback to page theme otherwise
		// when clearing theme it'll show the page theme.
		this.setFormTheme(this.formModel.theme || this.userTheme || new Theme());
	}
}
