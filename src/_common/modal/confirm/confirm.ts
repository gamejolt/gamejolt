import { mixins, Options, Prop } from 'vue-property-decorator';
import { BaseModal } from '../base';

@Options({})
export default class AppModalConfirm extends mixins(BaseModal) {
	@Prop(String) message!: string;
	@Prop(String) title!: string;
	@Prop(String) buttonType!: 'ok' | 'yes';

	ok() {
		this.modal.resolve(true);
	}

	cancel() {
		this.modal.resolve(false);
	}
}
