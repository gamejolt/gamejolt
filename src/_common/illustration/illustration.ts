import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../utils/vue';
import { AppThemeSvg } from '../theme/svg/svg';

@Component({
	components: {
		AppThemeSvg,
	},
})
export default class AppIllustration extends Vue {
	@Prop(propRequired(String)) src!: string;

	get hasContent() {
		return !!this.$scopedSlots.default;
	}
}
