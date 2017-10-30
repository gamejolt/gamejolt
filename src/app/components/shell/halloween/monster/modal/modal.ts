import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./modal.html?style=./modal.styl';
import { BaseModal } from '../../../../../../lib/gj-lib-client/components/modal/base';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppProgressBar } from '../../../../../../lib/gj-lib-client/components/progress/bar/bar';
import { Halloween2017MonsterBreakdown } from '../../../../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({
	components: {
		AppJolticon,
		AppProgressBar,
	},
})
export default class AppHalloweenShellMonsterModal extends BaseModal {
	@Prop(String) avatar: string;
	@Prop(Object) userBreakdown: Halloween2017MonsterBreakdown;
	@Prop(Object) globalBreakdown: Halloween2017MonsterBreakdown;
	@Prop(String) pun: string;
	@Prop(String) mood: string;
}
