import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
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
	@Prop({ type: Number, required: true }) stickerCount!: number;
	@Prop({ type: Boolean, required: true }) hasNew!: boolean;

	readonly formatNumber = formatNumber;
}
