import { mixins, Options } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { validateGaTrackingId } from '../../../../../_common/form-vue/validators';
import { Site } from '../../../../../_common/site/site-model';

class Wrapper extends BaseForm<Site> {}

@Options({})
export default class FormSiteSettings extends mixins(Wrapper) {
	modelClass = Site;

	readonly validateGaTrackingId = validateGaTrackingId;
}
