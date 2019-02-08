import View from '!view!./bio-form.html';
import { AppFormControlMarkdown } from 'game-jolt-frontend-lib/components/form-vue/control/markdown/markdown';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppFormControlMarkdown,
	},
})
export class FormBio extends BaseForm<User> {
	modelClass = User;
}
