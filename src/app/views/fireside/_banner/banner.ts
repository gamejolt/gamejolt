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

	private _isLoading = false;

	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	get shouldShowBanner() {
		if (this.isExpiring) {
			return true;
		}

		if (this.shouldNotViewStreams && !this.GJ_IS_CLIENT) {
			return true;
		}

		return false;
	}

	get hasOnClick() {
		return this.isExpiring;
	}

	get isExpiring() {
		return (
			this.c.status === 'joined' &&
			this.c.hasExpiryWarning &&
			this.c.canExtend &&
			!this.c.isStreaming &&
			!this._isLoading
		);
	}

	get shouldNotViewStreams() {
		return this.c.isStreaming && this.c.shouldNotViewStreams;
	}

	onClickBanner() {
		if (this.isExpiring) {
			this.extendFireside();
		}
	}

	private async extendFireside() {
		if (this._isLoading) {
			return;
		}

		try {
			this._isLoading = true;
			await extendFireside(this.c);
		} finally {
			this._isLoading = false;
		}
	}
}
