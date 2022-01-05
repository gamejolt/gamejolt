import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../_common/modal/base';

@Options({})
export default class AppClientAntiVirusModal extends mixins(BaseModal) {
	@Prop(String)
	title?: string;

	@Prop(String)
	message!: string;
}
