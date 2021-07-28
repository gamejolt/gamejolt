import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import AppCard from '../../../../_common/card/card.vue';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { Environment } from '../../../../_common/environment/environment.service';
import { duration } from '../../../../_common/filters/duration';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Growls } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/illustration.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { RouteStatus } from '../fireside';

@Component({
	components: {
		AppIllustration,
		AppProgressBar,
		AppCard,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStats extends Vue {
	@Prop(propRequired(Fireside)) fireside!: Fireside;
	@Prop(propRequired(String)) status!: RouteStatus;

	@AppState user!: AppStore['user'];

	private updateInterval: NodeJS.Timer | null = null;
	totalDurationText: string | null = null;
	expiresDurationText: string | null = null;
	expiresProgressValue: number | null = null;

	readonly GJ_IS_CLIENT = GJ_IS_CLIENT;

	get canPublish() {
		return (
			this.fireside &&
			this.user &&
			this.fireside.user.id === this.fireside.user.id &&
			this.status === 'joined' &&
			this.fireside.is_draft
		);
	}

	get canExtend() {
		return (
			this.fireside &&
			this.user &&
			this.user.id === this.fireside.user.id &&
			this.status === 'joined' &&
			this.expiresProgressValue !== null &&
			this.expiresProgressValue <= 95
		);
	}

	get shareUrl() {
		if (!this.fireside) {
			return null;
		}
		return Environment.baseUrl + this.$router.resolve(this.fireside.location).href;
	}

	get shareContent() {
		if (!this.fireside) {
			return null;
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
			this.totalDurationText = null;
			this.expiresDurationText = null;
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
		if (!this.fireside || this.status !== 'joined' || !this.fireside.is_draft) {
			return;
		}

		await this.fireside.$publish();
		Growls.success(this.$gettext(`Your Fireside is live!`));
	}

	async onClickExtend() {
		if (!this.fireside || this.status !== 'joined' || !this.canExtend) {
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

	copyShareUrl() {
		if (!this.shareUrl) {
			return;
		}
		Clipboard.copy(this.shareUrl);
	}
}
