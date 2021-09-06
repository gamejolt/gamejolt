import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { getAbsoluteLink } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import AppCard from '../../../../_common/card/card.vue';
import { configShareCard } from '../../../../_common/config/config.service';
import { duration } from '../../../../_common/filters/duration';
import { Growls } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/illustration.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppShareCard from '../../../../_common/share/card/card.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { FiresidePublishModal } from '../../../components/fireside/publish-modal/publish-modal.service';
import { FiresideController, FiresideControllerKey } from '../controller';
import { RouteStatus } from '../fireside';
import AppFiresideShare from './_share/share.vue';

@Component({
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
	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	@Prop({ type: String, required: true })
	status!: RouteStatus;

	@Prop({ type: Boolean, required: true })
	isStreaming!: boolean;

	@AppState user!: AppStore['user'];

	private updateInterval: NodeJS.Timer | null = null;
	totalDurationText: string | null = null;
	expiresDurationText: string | null = null;
	expiresProgressValue: number | null = null;

	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	get fireside() {
		return this.c.fireside;
	}

	get useShareCard() {
		return configShareCard.value;
	}

	get canManage() {
		if (!this.fireside) {
			return false;
		}

		return (
			this.user?.id === this.fireside.user.id ||
			this.fireside.community?.hasPerms('community-firesides')
		);
	}

	get canPublish() {
		return this.canManage && this.status === 'joined' && this.isDraft;
	}

	get canExtend() {
		return (
			this.canManage &&
			this.status === 'joined' &&
			this.expiresProgressValue !== null &&
			this.expiresProgressValue <= 95
		);
	}

	get isDraft() {
		return this.fireside?.is_draft ?? true;
	}

	get shareUrl() {
		if (!this.fireside) {
			return;
		}

		return getAbsoluteLink(this.$router, this.fireside.location);
	}

	get shareContent() {
		if (!this.fireside) {
			return;
		}

		return this.$gettextInterpolate('Join the %{ name } Fireside - Game Jolt', {
			name: this.fireside.title,
		});
	}

	mounted() {
		this.setupInterval();
		this.updateExpiryValues();
	}

	destroyed() {
		this.destroyInterval();
	}

	private setupInterval() {
		this.destroyInterval();
		this.updateInterval = setInterval(this.updateExpiryValues.bind(this), 1000);
	}

	private destroyInterval() {
		if (this.updateInterval) {
			clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
	}

	private updateExpiryValues() {
		if (!this.fireside) {
			return;
		}

		this.totalDurationText = duration((Date.now() - this.fireside.added_on) / 1000);

		if (this.fireside.expires_on > Date.now()) {
			const expiresInS = this.fireside.getExpiryInMs() / 1000;

			if (expiresInS > 60) {
				this.expiresDurationText = null;
			} else {
				this.expiresDurationText = duration(expiresInS);
			}

			if (expiresInS > 300) {
				this.expiresProgressValue = null;
			} else {
				this.expiresProgressValue = (expiresInS / 300) * 100;
			}
		} else {
			this.expiresDurationText = null;
		}
	}

	async onClickPublish() {
		if (this.status !== 'joined' || !this.isDraft || !this.fireside) {
			return;
		}

		const result = await FiresidePublishModal.show({ fireside: this.fireside });
		if (!result || !result.doPublish) {
			return;
		}

		await this.fireside.$publish();
		Growls.success(this.$gettext(`Your Fireside is live!`));
	}

	async onClickExtend() {
		if (this.status !== 'joined' || !this.canExtend || !this.fireside) {
			return;
		}

		const payload = await Api.sendRequest(
			`/web/dash/fireside/extend/${this.fireside.hash}`,
			{},
			{
				detach: true,
			}
		);
		if (payload.success && payload.extended) {
			this.fireside.expires_on = payload.expiresOn;
			this.updateExpiryValues();
		} else {
			Growls.info(
				this.$gettext(
					`Settle down there. Wait a couple seconds before playing with the fire again.`
				)
			);
		}
	}
}
