import { Community } from '../../../../_common/community/community.model';
import { AppTheme } from '../../../../_common/theme/theme';
import { number } from '../../../../_common/filters/number';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppTheme,
	},
})
export default class AppGameCommunityBadge extends Vue {
	@Prop(Community)
	community!: Community;

	readonly number = number;
}
