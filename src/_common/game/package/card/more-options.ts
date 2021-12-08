import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatFilesize } from '../../../filters/filesize';
import { GameBuild } from '../../build/build.model';
import { GamePackageCardModel } from './card.model';

@Options({})
export default class AppGamePackageCardMoreOptions extends Vue {
	@Prop(GamePackageCardModel) card!: GamePackageCardModel;

	readonly emulatorInfo = GameBuild.emulatorInfo;
	readonly formatFilesize = formatFilesize;

	@Emit('click')
	emitClick(_build: GameBuild) {}

	click(build: GameBuild) {
		this.emitClick(build);
	}
}
