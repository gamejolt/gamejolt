import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({})
export class FormSiteSettings extends BaseForm<Site> implements FormOnInit {
	modelClass = Site;

	onInit() {}
}
