import { Options, Prop, Vue } from 'vue-property-decorator';
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

	click(build: GameBuild) {
		this.$emit('click', build);
	}
}
