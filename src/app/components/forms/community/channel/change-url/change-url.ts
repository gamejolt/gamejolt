import { mixins, Options, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import AppFormCommunityChannelTitle from '../_title/title.vue';

type FormModel = {
	title: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppFormCommunityChannelTitle,
	},
})
export default class FormCommunityChannelChangeUrl extends mixins(Wrapper) {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(Array)) channels!: CommunityChannel[];

	modelClass = CommunityChannel;

	get isValid() {
		if (!this.valid) {
			return false;
		}

		return (
			!!this.formModel.title &&
			this.formModel.title.trim().length >= 3 &&
			this.formModel.title.trim().length <= 30 &&
			!this.channels
				.map(i => i.title.toLowerCase().trim())
				.includes(this.formModel.title.toLowerCase().trim())
		);
	}

	created() {
		this.form.resetOnSubmit = true;
	}
}
