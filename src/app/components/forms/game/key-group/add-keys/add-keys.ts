import { Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import AppExpand from '../../../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../../../_common/filters/number';
import { BaseForm, FormOnSubmit } from '../../../../../../_common/form-vue/form.service';
import { KeyGroup } from '../../../../../../_common/key-group/key-group.model';

@Options({
	components: {
		AppExpand,
	},
})
export default class FormGameKeyGroupAddKeys extends BaseForm<any> implements FormOnSubmit {
	@Prop(KeyGroup) keyGroup!: KeyGroup;

	warnOnDiscard = false;

	readonly formatNumber = formatNumber;
	readonly KeyGroup = KeyGroup;

	onSubmit() {
		return Api.sendRequest(
			`/web/dash/developer/games/key-groups/add-keys/` +
				`${this.keyGroup.game_id}/${this.keyGroup.id}`,
			this.formModel
		);
	}
}
