import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { Community } from '../community.model';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityVerifiedTick extends Vue {
	@Prop(Community)
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
