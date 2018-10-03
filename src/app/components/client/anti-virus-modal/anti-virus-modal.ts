import View from '!view!./anti-virus-modal.html';
import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';

@View
@Component({})
export default class AppClientAntiVirusModal extends BaseModal {
	@Prop(String)
	title?: string;

	@Prop(String)
	message!: string;
}
