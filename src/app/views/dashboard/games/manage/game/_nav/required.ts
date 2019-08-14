import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppManageGameNavRequired extends Vue {
	@Prop(Boolean) isComplete?: boolean;
}
