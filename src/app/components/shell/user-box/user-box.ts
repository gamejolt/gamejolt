import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import AppJolticon from '../../../../_common/jolticon/jolticon.vue';
import { number } from '../../../../_common/filters/number';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';

@Component({
	components: {
		AppJolticon,
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppShellUserBox extends Vue {
	@State app!: Store['app'];
}
