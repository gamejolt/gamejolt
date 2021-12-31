import { Options } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { Site } from '../../../../../_common/site/site-model';

@Options({})
export default class FormSiteSettings extends BaseForm<Site> {
	modelClass = Site;

	readonly validateGaTrackingId = validateGaTrackingId;
}
