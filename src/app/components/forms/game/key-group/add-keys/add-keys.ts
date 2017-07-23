import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./add-keys.html';
import { KeyGroup } from '../../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { FormOnSubmit } from '../../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { BaseForm } from '../../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { AppExpand } from '../../../../../../lib/gj-lib-client/components/expand/expand';
import { number } from '../../../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
		AppExpand,
	},
	filters: {
		number,
	},
})
export class FormGameKeyGroupAddKeys extends BaseForm<any> implements FormOnSubmit {
	@Prop(KeyGroup) keyGroup: KeyGroup;

	warnOnDiscard = false;

	number = number;
	KeyGroup = KeyGroup;

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/developer/games/key-groups/add-keys/` +
				`${this.keyGroup.game_id}/${this.keyGroup.id}`,
			this.formModel
		);
	}
}
