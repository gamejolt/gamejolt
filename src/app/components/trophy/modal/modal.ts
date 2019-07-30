import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/trophy/game-trophy.model';
import { UserBaseTrophy } from 'game-jolt-frontend-lib/components/user/trophy/user-base-trophy.model';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppUserVerifiedTick from 'game-jolt-frontend-lib/components/user/verified-tick/verified-tick.vue';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
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
