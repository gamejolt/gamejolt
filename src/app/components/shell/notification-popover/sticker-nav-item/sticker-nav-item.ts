import { Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppTimelineListItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellNotificationPopoverStickerNavItem extends Vue {
	@Prop(propRequired(Number)) stickerCount!: number;
	@Prop(propRequired(Boolean)) hasNew!: boolean;

	readonly number = number;
}
