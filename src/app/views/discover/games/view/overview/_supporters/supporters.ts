import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserAvatarImg from 'game-jolt-frontend-lib/components/user/user-avatar/img/img.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameSupportersModal } from '../../../../../../components/game/supporters/modal/modal.service';
import { RouteStore, RouteStoreModule } from '../../view.store';

@Component({
	components: {
		AppUserAvatarImg,
		AppUserCardHover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppDiscoverGamesViewOverviewSupporters extends Vue {
	@Prop(Array)
	supporters!: User[];

	@Prop(Number)
	supporterCount!: number;

	@RouteStoreModule.State
	game!: RouteStore['game'];

	viewAll() {
		GameSupportersModal.show({
			game: this.game,
			supporters: this.supporters,
			supporterCount: this.supporterCount,
		});
	}
}
