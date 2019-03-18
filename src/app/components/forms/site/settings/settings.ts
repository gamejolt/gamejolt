import { BaseForm } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import { Component } from 'vue-property-decorator';


@Component({})
export default class FormSiteSettings extends BaseForm<Site> {
	modelClass = Site;
}
