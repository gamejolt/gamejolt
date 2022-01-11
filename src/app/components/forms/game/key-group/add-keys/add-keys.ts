import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../../../_common/filters/number';
import { BaseForm, FormOnSubmit } from '../../../../../../_common/form-vue/form.service';
import { KeyGroup } from '../../../../../../_common/key-group/key-group.model';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppExpand,
	},
})
export default class FormGameKeyGroupAddKeys extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Object) keyGroup!: KeyGroup;

	readonly formatNumber = formatNumber;
	readonly KeyGroup = KeyGroup;

	created() {
		this.form.warnOnDiscard = false;
	}

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/developer/games/key-groups/add-keys/` +
				`${this.keyGroup.game_id}/${this.keyGroup.id}`,
			this.formModel
		);
	}
}
