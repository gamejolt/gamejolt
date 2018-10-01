import View from '!view!./supporters.html?style=./supporters.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppUserAvatarImg } from '../../../../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { User } from '../../../../../../../lib/gj-lib-client/components/user/user.model';
import { GameSupportersModal } from '../../../../../../components/game/supporters/modal/modal.service';
import { RouteState, RouteStore } from '../../view.store';

@View
@Component({
	components: {
		AppUserAvatarImg,
	},
	directives: {
		AppTooltip,
	},
})
export class AppDiscoverGamesViewOverviewSupporters extends Vue {
	@Prop(Array)
	supporters!: User[];

	@Prop(Number)
	supporterCount!: number;

	@RouteState
	game!: RouteStore['game'];

	viewAll() {
		GameSupportersModal.show({
			game: this.game,
			supporters: this.supporters,
			supporterCount: this.supporterCount,
		});
	}
}
