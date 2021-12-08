import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { Store } from '../../../store/index';

@Options({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellUserBox extends Vue {
	@State app!: Store['app'];

	readonly formatNumber = formatNumber;
}
