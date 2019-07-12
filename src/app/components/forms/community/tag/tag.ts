import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { CommunityTag } from 'game-jolt-frontend-lib/components/community/tag/tag.model';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class FormCommunityTag extends BaseForm<CommunityTag> implements FormOnInit {
	@Prop(Community)
	community!: Community;

	@Prop(Array)
	tags!: CommunityTag[];

	modelClass = CommunityTag;
	resetOnSubmit = true;

	get isValid() {
		return (
			!!this.formModel.tag &&
			this.formModel.tag.trim().length >= 3 &&
			!this.tags.map(i => i.tag.toLowerCase()).includes(this.formModel.tag.toLowerCase())
		);
	}

	onInit() {
		this.setField('community_id', this.community.id);
	}
}
