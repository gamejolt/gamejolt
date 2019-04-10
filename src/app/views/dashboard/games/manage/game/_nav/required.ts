import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppManageGameNavRequired extends Vue {
	@Prop(Boolean) isComplete?: boolean;
}
