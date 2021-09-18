import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AuthModal } from '../../../../../_common/auth/auth-modal.service';
import { Community } from '../../../../../_common/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { FiresideAddModal } from '../../add-modal/add-modal.service';
import AppFiresideAvatarBase from '../_base/base.vue';

@Component({
	components: {
		AppFiresideAvatarBase,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideAvatarAdd extends Vue {
	@AppState user!: AppStore['user'];

	@Prop({ type: Community, required: false, default: undefined })
	community!: Community | undefined;

	get isCommunity() {
		return this.community !== undefined;
	}

	get isDisabled() {
		return !!this.community && !this.community.is_member;
	}

	$refs!: {
		header: HTMLDivElement;
	};

	async onClick() {
		if (!this.user) {
			AuthModal.show();
			return;
		}

		const fireside = await FiresideAddModal.show({ community: this.community });
		if (fireside instanceof Fireside) {
			this.$router.push(fireside.location);
		}
	}
}
