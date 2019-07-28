import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { UserBaseTrophy } from 'game-jolt-frontend-lib/components/user/trophy/user-base-trophy.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
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

	onClick() {
		if (this.isNew) {
			this.userTrophy.$view();
		}

		TrophyModal.show(this.userTrophy);
	}
}
