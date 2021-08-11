import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { Game } from '../../../../_common/game/game.model';
import { AppStore } from '../../../../_common/store/app-store';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import { TrophyModal } from '../modal/modal.service';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppTrophyThumbnail,
		AppFadeCollapse,
	},
})
export default class AppTrophyCard extends Vue {
	@State
	app!: AppStore;

	@Prop(Object)
	userTrophy!: UserBaseTrophy;

	get trophy() {
		return this.userTrophy.trophy!;
	}

	get isNew() {
		if (this.app.user) {
			return !this.userTrophy.viewed_on && this.userTrophy.user_id === this.app.user!.id;
		}
		return false;
	}

	get bgClass() {
		return '-trophy-difficulty-' + this.trophy.difficulty;
	}

	get isGame() {
		return this.userTrophy instanceof UserGameTrophy && !!this.userTrophy.game;
	}

	get gameTitle() {
		if (this.userTrophy instanceof UserGameTrophy && this.userTrophy.game instanceof Game) {
			return this.userTrophy.game.title;
		}
		return this.$gettext(`Game Trophy`);
	}

	get loggedInUserUnlocked() {
		return this.app.user && this.userTrophy.user_id === this.app.user.id;
	}

	onClick() {
		TrophyModal.show(this.userTrophy);
	}
}
