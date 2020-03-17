import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { AppTooltip } from '../../../../../../_common/tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppEventItemControlsFiresidePostStickers extends Vue {
	@Prop(propRequired(Boolean)) isActive!: boolean;

	@Emit('click')
	click() {}
}
