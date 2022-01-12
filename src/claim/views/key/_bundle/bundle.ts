import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/thumbnail.vue';
import { useCommonStore } from '../../../../_common/store/common-store';

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

	@Prop(String)
	accessKey?: string;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

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
