import View from '!view!./community.html';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component } from 'vue-property-decorator';

@View
@Component({})
export class FormCommunity extends BaseForm<Community> {
	modelClass = Community;
	resetOnSubmit = true;

	get loadUrl() {
		let url = '/web/dash/communities/save';
		if (this.method === 'edit') {
			url += '/' + this.model!.id;
		}
		return url;
	}

	get communityUrl() {
		return `gamejolt.com/c/<b>${this.formModel.path || '_'}</b>`;
	}

	get canEditUrl() {
		return !this.formModel.id || !this.formModel.published_on;
	}

	get hasPerms() {
		return this.formModel.hasPerms('all');
	}
}
