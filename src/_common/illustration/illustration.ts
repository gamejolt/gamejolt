import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import { AppThemeSvg } from '../theme/svg/svg';

@Component({
	components: {
		AppThemeSvg,
	},
})
export default class AppIllustration extends Vue {
	@Prop(propRequired(String)) src!: string;
	@Prop(propOptional(Boolean)) sm!: boolean;

	get hasContent() {
		return !!this.$scopedSlots.default;
	}
}
