import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/expand.vue';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import {
	extendFireside,
	FiresideController,
	FiresideControllerKey,
	getFiresideLink,
} from '../controller/controller';

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
		return this.isExpiring || this.shouldNotViewStreams;
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

	get hasOnClick() {
		return this.isExpiring || (this.shouldNotViewStreams && GJ_IS_CLIENT);
	}

	onClickBanner() {
		if (this.isExpiring) {
			this.extendFireside();
		} else if (this.shouldNotViewStreams && GJ_IS_CLIENT) {
			const url = getFiresideLink(this.c, this.$router);

			if (url) {
				Navigate.gotoExternal(url);
			}
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
