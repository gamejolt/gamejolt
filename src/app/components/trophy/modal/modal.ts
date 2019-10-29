import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import { BaseModal } from '../../../../_common/modal/base';
import { Screen } from '../../../../_common/screen/screen-service';
import { SiteTrophy } from '../../../../_common/site/trophy/trophy.model';
import { AppStore } from '../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../_common/user/user.model';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppTrophyThumbnail,
		AppTimeAgo,
		AppUserAvatarList,
		AppUserAvatarImg,
		AppUserCardHover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppTrophyModal extends BaseModal {
	@State
	app!: AppStore;

	@Prop(Object)
	userTrophy!: UserBaseTrophy;

	completionPercentage: number | null = null;
	friends: User[] | null = null;

	readonly Screen = Screen;

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
		if (!this.userTrophy.trophy) {
			return false;
		}

		return !this.userTrophy.trophy.is_owner;
	}

	get completionPercentageForDisplay() {
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

	get game() {
		if (this.userTrophy instanceof UserGameTrophy) {
			return this.userTrophy.game;
		}
	}

	get loggedInUserUnlocked() {
		return this.app.user && this.userTrophy.user_id === this.app.user.id;
	}

	get artist() {
		if (this.trophy instanceof SiteTrophy && this.trophy.artist instanceof User) {
			return this.trophy.artist;
		}
	}

	mounted() {
		if (this.isGame) {
			this.populatePercentage();
		}
		if (this.app.user) {
			this.populateFriends();

			if (this.userTrophy.user_id === this.app.user.id && !this.userTrophy.viewed_on) {
				this.userTrophy.$view();
			}
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
