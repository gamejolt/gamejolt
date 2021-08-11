import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameBuild } from '../../../../_common/game/build/build.model';
import { Game } from '../../../../_common/game/game.model';

@Options({})
export default class AppGameCoverButtonsBuildButtons extends Vue {
	@Prop(Game) game!: Game;
	@Prop(Array) downloadableBuilds!: GameBuild[];
	@Prop(Array) browserBuilds!: GameBuild[];
	@Prop(Array) installableBuilds!: GameBuild[];

	@Emit('play')
	emitPlay() {}

	@Emit('download')
	emitDownload() {}
}
