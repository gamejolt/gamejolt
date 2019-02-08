import View from '!view!./avatar.html?style=./avatar.styl';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { UserAvatarModal } from '../../../../app/components/user/avatar-modal/avatar-modal.service';
import { AppEditableOverlay } from '../../../../lib/gj-lib-client/components/editable-overlay/editable-overlay';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { Store } from '../../../store/index';

@View
@Component({
	name: 'RouteFlowAvatar',
	components: {
		AppEditableOverlay,
		AppUserAvatar,
	},
})
export default class RouteFlowAvatar extends BaseRouteComponent {
	@State
	app!: Store['app'];

	goNext() {
		this.$router.push({ name: 'flow.bio' });
	}

	async showEditAvatar() {
		await UserAvatarModal.show();
		if (!!this.app.user && !!this.app.user.avatar_media_item) {
			this.goNext();
		}
	}

	onClickNext() {
		this.goNext();
	}
}
