import { BaseModal } from 'game-jolt-frontend-lib/components/modal/base';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { UserGameTrophy } from 'game-jolt-frontend-lib/components/user/trophy/game-trophy.model';
import { UserBaseTrophy } from 'game-jolt-frontend-lib/components/user/trophy/user-base-trophy.model';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from 'game-jolt-frontend-lib/components/user/verified-tick/verified-tick.vue';
import { Component, Prop } from 'vue-property-decorator';
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
}
