import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { fuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Component({
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

	readonly fuzzynumber = fuzzynumber;
}
