import { Component, Prop } from 'vue-property-decorator';

import { BaseModal } from '../base';

@Component({})
export default class AppModalConfirm extends BaseModal {
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
