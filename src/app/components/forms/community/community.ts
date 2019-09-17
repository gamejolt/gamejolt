import { Component } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { BaseForm, FormOnSubmitSuccess } from '../../../../_common/form-vue/form.service';

@Component({})
export default class FormCommunity extends BaseForm<Community> implements FormOnSubmitSuccess {
	modelClass = Community;

	onSubmitSuccess(community: Community) {
		this.$router.push(community.routeEditLocation);
	}
}
