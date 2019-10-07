import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { AppStore } from '../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { User } from '../../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppTrophyThumbnail,
		AppUserAvatar,
		AppGameThumbnail,
		AppTimeAgo,
		AppUserVerifiedTick,
	},
})
export default class AppTrophyModal extends BaseModal {
	@State
	app!: AppStore;

	@Prop(Object)
	userTrophy!: UserBaseTrophy;

	get trophy() {
		return this.userTrophy.trophy!;
	}

	get bgClass() {
		return '-trophy-difficulty-' + this.trophy.difficulty;
	}

	get isGame() {
		return this.userTrophy instanceof UserGameTrophy && !!this.userTrophy.game;
	}

	get canReceiveExp() {
		if (!this.isGame) {
			return true;
		}
		return (
			this.userTrophy instanceof UserGameTrophy &&
			this.userTrophy.game instanceof Game &&
			this.userTrophy.game.developer.id !== this.userTrophy.user_id
		);
	}

	get isDeveloper() {
		return (
			this.userTrophy instanceof UserGameTrophy &&
			this.userTrophy.game instanceof Game &&
			this.app.user instanceof User &&
			this.userTrophy.game.developer.id === this.app.user.id
		);
	}

	get isAchiever() {
		return this.app.user instanceof User && this.userTrophy.user_id === this.app.user.id;
	}
}
