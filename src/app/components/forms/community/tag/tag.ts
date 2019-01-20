import View from '!view!./tag.html?style=./tag.styl';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { CommunityTag } from 'game-jolt-frontend-lib/components/community/tag/tag.model';
import { BaseForm, FormOnInit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class FormCommunityTag extends BaseForm<CommunityTag> implements FormOnInit {
	@Prop(Community)
	community!: Community;

	modelClass = CommunityTag;
	resetOnSubmit = true;

	onInit() {
		this.setField('community_id', this.community.id);
	}
}
