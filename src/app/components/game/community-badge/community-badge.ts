import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Community } from '../../../../_common/community/community.model';
import { number } from '../../../../_common/filters/number';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppTheme } from '../../../../_common/theme/theme';

@Component({
	components: {
		AppTheme,
		AppMediaItemBackdrop,
	},
})
export default class AppGameCommunityBadge extends Vue {
	@Prop(Community)
	community!: Community;

	readonly number = number;
}
