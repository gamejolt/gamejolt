import { Options } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import AppFormControlTheme from '../../../../_common/form-vue/control/theme/theme.vue';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmitSuccess,
} from '../../../../_common/form-vue/form.service';
import { Theme } from '../../../../_common/theme/theme.model';
import { ThemeMutation, ThemeState, ThemeStore } from '../../../../_common/theme/theme.store';
import { Store } from '../../../store';
import AppPostAddButtonFormControl from '../../post/add-button/form-control/form-control.vue';

@Options({
	components: {
		AppPostAddButtonFormControl,
		AppFormControlTheme,
	},
})
export default class FormCommunity
	extends BaseForm<Community>
	implements FormOnInit, FormOnSubmitSuccess
{
	modelClass = Community;

	@Action
	joinCommunity!: Store['joinCommunity'];

	@ThemeMutation
	setFormTheme!: ThemeStore['setFormTheme'];

	@ThemeState
	userTheme!: ThemeStore['userTheme'];

	onInit() {
		this.warnOnDiscard = this.method === 'edit';
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

	destroyed() {
		this.setFormTheme(null);
	}

	onThemeChanged() {
		// Default theme would be the user theme. Don't want to fallback to page theme otherwise
		// when clearing theme it'll show the page theme.
		this.setFormTheme(this.formModel.theme || this.userTheme || new Theme());
	}
}
