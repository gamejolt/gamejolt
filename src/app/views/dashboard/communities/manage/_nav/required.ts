import View from '!view!./required.html?style=./required.styl';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { AppJolticon } from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTooltip,
	},
})
export class AppManageCommunityNavRequired extends Vue {
	@Prop(Boolean)
	isComplete?: boolean;
}
