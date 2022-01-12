import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellUserBox extends Vue {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	readonly formatNumber = formatNumber;
}
