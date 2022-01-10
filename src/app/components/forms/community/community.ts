import { mixins, Options } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import AppFormControlTheme from '../../../../_common/form-vue/controls/AppFormControlTheme.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import { validateUrlPath } from '../../../../_common/form-vue/validators';
import { DefaultTheme } from '../../../../_common/theme/theme.model';
import { ThemeMutation, ThemeState, ThemeStore } from '../../../../_common/theme/theme.store';
import { Store } from '../../../store';
import AppPostAddButtonFormControl from '../../post/add-button/AppPostAddButtonFormControl.vue';

class Wrapper extends BaseForm<Community> {}

@Options({
	components: {
		AppPostAddButtonFormControl,
		AppFormControlTheme,
		AppFormControlToggle,
	},
})
export default class FormCommunity extends mixins(Wrapper) implements FormOnSubmitSuccess {
	modelClass = Community;

	@Action
	joinCommunity!: Store['joinCommunity'];

	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

	@ThemeState
	userTheme!: ThemeStore['userTheme'];

	readonly validateUrlPath = validateUrlPath;

	created() {
		this.form.warnOnDiscard = this.method === 'edit';
	}

	onSubmitSuccess(response: any) {
		if (this.method !== 'add') {
			return;
		}

		const community = new Community(response.community);

		// When creating a community you get auto joined to it,
		// but aside from the actual join operation we also do other things
		// in this store action so we gotta call it anyways.
		this.joinCommunity({ community });

		this.$router.push(community.routeEditLocation);
	}

	onPostPlaceholderChange(placeholder: string) {
		this.setField('post_placeholder_text', placeholder || null);
	}

	unmounted() {
		this.setFormTheme(null);
	}

	onThemeChanged() {
		// Default theme would be the user theme. Don't want to fallback to page theme otherwise
		// when clearing theme it'll show the page theme.
		this.setFormTheme(this.formModel.theme ?? this.userTheme ?? DefaultTheme);
	}
}
