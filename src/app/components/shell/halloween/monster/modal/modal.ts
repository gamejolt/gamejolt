import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./modal.html?style=./modal.styl';
import { BaseModal } from '../../../../../../lib/gj-lib-client/components/modal/base';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppProgressBar } from '../../../../../../lib/gj-lib-client/components/progress/bar/bar';

@View
@Component({
	components: {
		AppJolticon,
		AppProgressBar,
	},
})
export default class AppHalloweenShellMonsterModal extends BaseModal {
	@Prop(String) avatar: string;
}
