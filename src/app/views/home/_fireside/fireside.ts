import Vue from 'vue';
import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppFiresideAvatarAdd from '../../../components/fireside/avatar/add/add.vue';
import AppFiresideAvatar from '../../../components/fireside/avatar/avatar.vue';
import AppFiresideAvatarBase from '../../../components/fireside/avatar/_base/base.vue';

@Component({
	components: {
		AppFiresideAvatar,
		AppLoadingFade,
		AppFiresideAvatarAdd,
		AppFiresideAvatarBase,
		AppScrollScroller,
	},
})
export default class AppHomeFireside extends Vue {
	@Prop({ type: Array, required: true })
	firesides!: Fireside[];

	@Prop({ type: Boolean, required: true })
	isLoading!: boolean;

	@Prop({ type: Fireside, required: false, default: null })
	userFireside!: Fireside | null;

	@Prop({ type: Boolean, required: false, default: false })
	showPlaceholders!: boolean;

	@Emit('request-refresh') emitRequestRefresh() {}

	readonly Screen = Screen;

	get displayFiresides() {
		const list = Array.apply([], this.firesides) as Fireside[];
		if (this.userFireside) {
			list.unshift(this.userFireside);
		}

		return Object.freeze(this.shouldDisplaySingleRow ? list.slice(0, this.gridColumns) : list);
	}

	get shouldDisplaySingleRow() {
		return Screen.isMobile;
	}

	get gridColumns() {
		return Screen.isMobile ? 5 : 3;
	}

	get gridStyling() {
		return {
			display: 'grid',
			gridTemplateColumns: `repeat(${this.gridColumns}, 1fr)`,
			gridGap: '16px',
		};
	}

	onFiresideExpired() {
		// When a fireside expired while showing it here, refresh the list.
		// It will be excluded from the next fetch.
		this.emitRequestRefresh();
	}
}
