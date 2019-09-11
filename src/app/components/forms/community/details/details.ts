import { Component } from 'vue-property-decorator';
import { Community } from '../../../../../_common/community/community.model';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

@Component({})
export default class FormCommunityDetails extends BaseForm<Community> {
	modelClass = Community;
	saveMethod = '$saveDetails' as '$saveDetails';
}
