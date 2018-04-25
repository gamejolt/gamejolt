import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import View from '!view!./item.html?style=./item.styl';

import { UserFriendship } from '../../../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppScrollInview } from '../../../../../lib/gj-lib-client/components/scroll/inview/inview';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppCard } from '../../../../../lib/gj-lib-client/components/card/card';
import { AppUserAvatarImg } from '../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	components: {
		AppScrollInview,
		AppCard,
		AppUserAvatarImg,
		AppJolticon,
	},
	directives: {
		AppTooltip,
	},
})
export class AppFriendRequestPopoverItem extends Vue {
	@Prop(UserFriendship) request: UserFriendship;

	@AppState user: AppStore['user'];

	isInview = false;

	readonly Screen = Screen;

	get them() {
		return this.request.getThem(this.user!);
	}

	/**
	 * Is it a request we sent?
	 */
	get isPending() {
		return this.request.target_user.id !== this.user!.id;
	}

	@Emit()
	cancel() {}

	@Emit()
	accept() {}

	@Emit()
	reject() {}
}
