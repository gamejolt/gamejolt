import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Community } from '../community.model';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityVerifiedTick extends Vue {
	@Prop(Object)
	community!: Community;

	@Prop(Boolean)
	big!: boolean;

	@Prop(Boolean)
	small!: boolean;

	@Prop(Boolean)
	noTooltip!: boolean;

	get tooltip() {
		if (this.community.is_verified && !this.noTooltip) {
			return this.$gettext('Verified Community');
		}
	}
}
