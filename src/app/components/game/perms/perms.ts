import { h, ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Perm } from '../../../../_common/collaborator/collaboratable';
import { GameModel } from '../../../../_common/game/game.model';
import { useGameDashRouteController } from '../../../views/dashboard/games/manage/manage.store';

@Options({})
export class AppGamePerms extends Vue {
	@Prop(Object)
	game?: GameModel;

	@Prop({ type: String, default: '' })
	required!: string;

	@Prop(Boolean)
	either?: boolean;

	@Prop({ type: String, default: 'span' })
	tag!: string;

	@Prop(Boolean)
	debug?: boolean;

	gameRouteStore = setup(() => ref(useGameDashRouteController()));

	get targetGame() {
		if (this.game) {
			return this.game;
		}

		if (this.gameRouteStore) {
			return this.gameRouteStore.game;
		}

		return undefined;
	}

	get hasPerms() {
		const perms: Perm[] = (this.required as any).split(',');

		// if (this.debug && this.targetGame) {
		// 	console.log(
		// 		'Checking that ' +
		// 			JSON.stringify(this.targetGame.perms) +
		// 			' has perms ' +
		// 			JSON.stringify(perms.filter(perm => !!perm))
		// 	);
		// }

		if (!this.targetGame) {
			throw new Error(`Target game doesn't exist for app-game-perms component.`);
		}

		return this.targetGame.hasPerms(
			perms.filter(perm => !!perm),
			this.either
		);
	}

	render() {
		if (this.hasPerms) {
			return h(this.tag, {}, this.$slots.default?.());
		}
	}
}
