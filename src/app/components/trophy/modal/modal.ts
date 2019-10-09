import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { State } from 'vuex-class/lib/bindings';
import { Api } from '../../../../_common/api/api.service';
import { Game } from '../../../../_common/game/game.model';
import { BaseModal } from '../../../../_common/modal/base';
import { AppStore } from '../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppTrophyThumbnail,
		AppTimeAgo,
		AppUserAvatarList,
	},
})
export default class AppTrophyModal extends BaseModal {
	@State
	app!: AppStore;

	@Prop(Object)
	userTrophy!: UserBaseTrophy;

	completionPercentage: number | null = null;
	friends: User[] | null = null;

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

	get completionPercentageDisplay() {
		if (this.completionPercentage) {
			if (this.completionPercentage <= 1) {
				return 1;
			}
			return Math.floor(this.completionPercentage);
		}
	}

	get shouldShowFriends() {
		return this.friends && this.friends.length > 0;
	}

	mounted() {
		if (this.isGame) {
			this.populatePercentage();
		}
		if (this.app.user) {
			this.populateFriends();
		}
	}

	async populatePercentage() {
		const payload = await Api.sendRequest(
			`/web/profile/trophies/game-trophy-percentage/${this.trophy.id}`,
			undefined,
			{ detach: true }
		);
		if (payload.percentage) {
			this.completionPercentage = payload.percentage;
		}
	}

	async populateFriends() {
		const type = this.isGame ? 'game' : 'site';
		const payload = await Api.sendRequest(
			`/web/profile/trophies/friends/${type}/${this.trophy.id}`
		);
		if (payload.users) {
			this.friends = User.populate(payload.users);
		}
	}
}
