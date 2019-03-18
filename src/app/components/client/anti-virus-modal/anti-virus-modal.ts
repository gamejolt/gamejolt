import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppClientAntiVirusModal extends BaseModal {
	@Prop(String)
	title?: string;

	@Prop(String)
	message!: string;
}
