import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import {
	extendFireside,
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';

@Component({
	components: {
		AppExpand,
		AppProgressBar,
	},
})
export default class AppFiresideBanner extends Vue {
	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	private isLoading = false;

	get shouldShowBanner() {
		return this.isExpiring;
	}

	get isExpiring() {
		return (
			this.c.status === 'joined' &&
			this.c.hasExpiryWarning &&
			this.c.canExtend &&
			!this.c.isStreaming &&
			!this.isLoading
		);
	}

	onClickBanner() {
		this.extendFireside();
	}

	private async extendFireside() {
		if (this.isLoading) {
			return;
		}

		try {
			this.isLoading = true;
			await extendFireside(this.c);
		} finally {
			this.isLoading = false;
		}
	}
}
