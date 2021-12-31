import { Options, Prop } from 'vue-property-decorator';
import AppExpand from '../../../../../_common/expand/expand.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { validateDomain } from '../../../../../_common/form-vue/validators';
import { Game } from '../../../../../_common/game/game.model';
import { Site } from '../../../../../_common/site/site-model';
import { User } from '../../../../../_common/user/user.model';

interface FormModel {
	type: string;
}

@Options({
	components: {
		AppFormControlToggle,
		AppExpand,
	},
})
export default class FormSiteDomain extends BaseForm<FormModel> {
	@Prop(User) user!: User;
	@Prop(Game) game?: Game;

	modelClass = Site as any;
	saveMethod = '$saveDomain' as const;

	readonly validateDomain = validateDomain;

	get ioUrl() {
		return this.createUrl('gamejolt.io');
	}

	get afUrl() {
		return this.createUrl('indie.af');
	}

	private createUrl(baseDomain: string) {
		let url = this.user.username.toLowerCase() + `.<strong>${baseDomain}</strong>`;
		if (this.game) {
			url += '/' + this.game.path;
		}
		return url;
	}
}
