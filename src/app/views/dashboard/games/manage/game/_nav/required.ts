import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';
import AppJolticon from '../../../../../../../_common/jolticon/jolticon.vue';
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
