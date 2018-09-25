import View from '!view!./anti-virus-modal.html';
import { Component, Prop } from 'vue-property-decorator';
import { BaseModal } from '../../../../lib/gj-lib-client/components/modal/base';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppClientAntiVirusModal extends BaseModal {
	@Prop(String)
	title?: string;

	@Prop(String)
	message!: string;
}
