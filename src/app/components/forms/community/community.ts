import { Component } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';
import { Store } from '../../../store';

@Component({})
export default class FormCommunity extends BaseForm<Community> implements FormOnSubmitSuccess {
	modelClass = Community;
	warnOnDiscard = false;

	@Action
	joinCommunity!: Store['joinCommunity'];

	onSubmitSuccess(response: any) {
		const community = new Community(response.community);

		// When creating a community you get auto joined to it,
		// but aside from the actual join operation we also do other things
		// in this store action so we gotta call it anyways.
		this.joinCommunity(community);

		this.$router.push(community.routeEditLocation);
	}
}
