import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppManageGameNavRequired extends Vue {
	@Prop(Boolean) isComplete?: boolean;
}
