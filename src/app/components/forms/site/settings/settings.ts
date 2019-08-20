import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { Site } from '../../../../../_common/site/site-model';
import { Component } from 'vue-property-decorator';

@Component({})
export default class FormSiteSettings extends BaseForm<Site> {
	modelClass = Site;
}
