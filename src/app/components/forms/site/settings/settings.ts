import { Component } from 'vue-property-decorator';
import * as View from '!view!./settings.html';

import { BaseForm } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Site } from '../../../../../lib/gj-lib-client/components/site/site-model';

@View
@Component({})
export class FormSiteSettings extends BaseForm<Site> {
	modelClass = Site;
}
