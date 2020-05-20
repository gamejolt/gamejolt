import Vue from 'vue';
import { Prop } from 'vue-property-decorator';
import { propOptional } from '../../utils/vue';

export default class AppTooltip extends Vue {
	@Prop(propOptional(String, '*_not_working_*'))
	tooltipText!: string;

	get text() {
		return this.tooltipText;
	}
}
