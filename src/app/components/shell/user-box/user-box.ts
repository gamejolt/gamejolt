import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
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
