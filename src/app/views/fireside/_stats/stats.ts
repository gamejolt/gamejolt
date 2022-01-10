import { Vue } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/card.vue';
import AppIllustration from '../../../../_common/illustration/illustration.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppShareCard from '../../../../_common/share/card/card.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import {
	extendFireside,
	FiresideController,
	FiresideControllerKey,
	publishFireside,
} from '../../../components/fireside/controller/controller';
import AppFiresideShare from '../_share/share.vue';

@Options({
	components: {
		AppIllustration,
		AppProgressBar,
		AppCard,
		AppScrollScroller,
		AppShareCard,
		AppFiresideShare,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStats extends Vue {
	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	@AppState user!: AppStore['user'];

	get fireside() {
		return this.c.fireside;
	}

	onClickPublish() {
		publishFireside(this.c);
	}

	onClickExtend() {
		extendFireside(this.c);
	}
}
