import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { formatFilesize } from '../../../_common/filters/filesize';
import { formatUcwords } from '../../../_common/filters/ucwords';
import { GameBuild } from '../../../_common/game/build/build.model';
import { AppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { Store } from '../../store/index';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppIncludedItems extends Vue {
	readonly ucwords = formatUcwords;
	readonly filesize = formatFilesize;

	@State package!: Store['package'];
	@State packagePayload!: Store['packagePayload'];
	@State packageCard!: Store['packageCard'];

	hasSupport(build: GameBuild, os: string) {
		return this.checkBuildSupport(build, os) || this.checkBuildSupport(build, os + '_64');
	}

	is64BitOnly(build: GameBuild, os: string) {
		return !this.checkBuildSupport(build, os) && this.checkBuildSupport(build, os + '_64');
	}

	private checkBuildSupport(build: GameBuild, os: string) {
		return (build as any)['os_' + os] ?? false;
	}
}
