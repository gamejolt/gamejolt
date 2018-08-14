import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./supporters.html?style=./supporters.styl';

import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatarImg } from '../../../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { User } from '../../../../../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
	directives: {
		AppTooltip,
	},
})
export class AppDiscoverGamesViewOverviewSupporters extends Vue {
	@Prop(Array) supporters: User[];
}
