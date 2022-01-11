import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { propOptional } from '../../../../utils/vue';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { Store } from '../../../store/index';

@Options({
	components: {
		AppGameThumbnail,
	},
})
export default class AppKeyBundle extends Vue {
	@Prop({ type: Object, required: true })
	payload!: any;

	@Prop({ type: String, required: true })
	loginUrl!: string;

	@Prop(propOptional(String))
	accessKey?: string;

	@State
	app!: Store['app'];

	bundle: GameBundle = null as any;
	games: Game[] = [];

	@Emit('claim')
	emitClaim(_bundle: GameBundle) {}

	created() {
		this.bundle = new GameBundle(this.payload.bundle);
		this.games = Game.populate(this.payload.games);
	}

	claim() {
		this.emitClaim(this.bundle);
	}
}
