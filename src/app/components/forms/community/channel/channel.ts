import { Component, Prop } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { BaseForm, FormOnInit } from '../../../../../_common/form-vue/form.service';

@Component({})
export default class FormCommunityChannel extends BaseForm<CommunityChannel> implements FormOnInit {
	@Prop(Community)
	community!: Community;

	@Prop(Array)
	channels!: CommunityChannel[];

	modelClass = CommunityChannel;
	resetOnSubmit = true;

	get isValid() {
		return (
			!!this.formModel.title &&
			this.formModel.title.trim().length >= 3 &&
			this.formModel.title.trim().length <= 30 &&
			!this.channels
				.map(i => i.title.toLowerCase())
				.includes(this.formModel.title.toLowerCase())
		);
	}

	onInit() {
		this.setField('community_id', this.community.id);
	}
}
