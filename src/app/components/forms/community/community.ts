import { Component } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import { Store } from '../../../store';

@Component({})
export default class FormCommunity extends BaseForm<Community> implements FormOnSubmitSuccess {
	modelClass = Community;

	@Action
	joinCommunity!: Store['joinCommunity'];

	onSubmitSuccess(response: any) {
		const community = new Community(response.community);
		this.joinCommunity(community);
		this.$router.push(community.routeEditLocation);
	}
}
