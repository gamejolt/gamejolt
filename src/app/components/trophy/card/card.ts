import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { AppStore } from '../../../../_common/store/app-store';
import { UserGameTrophy } from '../../../../_common/user/trophy/game-trophy.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import { TrophyModal } from '../modal/modal.service';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Component({
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

	onClick() {
		TrophyModal.show(this.userTrophy);
	}
}
