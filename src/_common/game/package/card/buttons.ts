import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { formatFilesize } from '../../../filters/filesize';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import { GameBuild } from '../../build/build.model';
import { GamePackage } from '../package.model';
import { GamePackageCardModel } from './card.model';
import AppGamePackageCardMoreOptions from './more-options.vue';

@Options({
	components: {
		AppPopper,
		AppGamePackageCardMoreOptions,
	},
})
export default class AppGamePackageCardButtons extends Vue {
	@Prop(GamePackage) package!: GamePackage;
	@Prop(GamePackageCardModel) card!: GamePackageCardModel;

	readonly Screen = Screen;
	readonly filesize = formatFilesize;

	@Emit('click')
	emitClick(_data: { build: GameBuild; fromExtraSection: boolean }) {}

	click(build: GameBuild, fromExtraSection = false) {
		this.emitClick({ build, fromExtraSection });
	}
}
