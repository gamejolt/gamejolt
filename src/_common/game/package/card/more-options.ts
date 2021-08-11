import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { filesize } from '../../../filters/filesize';
import { GameBuild } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';

@Options({
	filters: {
		filesize,
	},
})
export default class AppGamePackageCardMoreOptions extends Vue {
	@Prop(GamePackageCardModel) card!: GamePackageCardModel;

	emulatorInfo = GameBuild.emulatorInfo;

	@Emit('click')
	emitClick(_build: GameBuild) {}

	click(build: GameBuild) {
		this.emitClick(build);
	}
}
