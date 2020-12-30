import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityChannel } from '../../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../../_common/community/community.model';
import { BaseForm, FormOnInit } from '../../../../../../_common/form-vue/form.service';
import AppFormCommunityChannelPermissions from '../_permissions/permissions.vue';
import AppFormCommunityChannelTitle from '../_title/title.vue';

class FormModel extends CommunityChannel {
	permission_posting = 'all';
}

@Component({
	components: {
		AppFormCommunityChannelTitle,
		AppFormCommunityChannelPermissions,
	},
})
export default class FormCommunityChannelAdd extends BaseForm<FormModel> implements FormOnInit {
	@Prop(propRequired(Community)) community!: Community;
	@Prop(propRequired(Array)) channels!: CommunityChannel[];

	modelClass = FormModel;
	resetOnSubmit = true;

	get types() {
		return [
			{
				radioValue: 'post-feed',
				text: this.$gettext(`Posts`),
				helpText: this.$gettext(`Displays a feed of posts`),
			},
			{
				radioValue: 'competition',
				text: this.$gettext(`Jam`),
				helpText: this.$gettext(`Contains a Game Jam`),
			},
		];
	}

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

	onInit() {
		this.setField('community_id', this.community.id);
		this.setField('type', 'post-feed');
		this.setField('permission_posting', 'all');
	}
}
