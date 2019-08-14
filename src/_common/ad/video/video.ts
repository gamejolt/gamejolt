import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { Environment } from '../../../../components/environment/environment.service';
import { Analytics } from '../../../../components/analytics/analytics.service';
import { Ads } from '../../../../components/ad/ads.service';
import { time } from '../../../filters/time';
import { loadScript } from '../../../../utils/utils';
import AppLoading from '../../loading/loading.vue'
import AppJolticon from '../../jolticon/jolticon.vue'

const ImaScriptSrc = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
const AdSlotWidth = 910;
const AdSlotHeight = 512;

@Component({
	filters: {
		time,
	},
	components: {
		AppLoading,
		AppJolticon,
	},
})
export default class AppAdVideo extends Vue {
	@Prop(String) resource!: string;
	@Prop(Number) resourceId!: number;
	@Prop({ type: String, default: 'game' })
	resourceLabel!: string;
	@Prop(String) trackingLabel!: string;

	private videoElem!: HTMLVideoElement;
	private adContainerElem!: HTMLElement;

	isLoading = true;

	private adsManager: any;
	isAdPlaying = true;

	private remainingInterval: any;
	timeRemaining: number | null = null;

	blankVideoSrc: string = require('./blank-video.mp4');

	async mounted() {
		try {
			await loadScript(ImaScriptSrc);
			await this.bootstrap();
		} catch (e) {
			// May be DOMError or google.ima.AdError.
			if (e.message) {
				Analytics.trackEvent(this.trackingLabel || 'Video Ad', 'Ad Error', e.message);
				return;
			}

			switch (e.getErrorCode()) {
				case 303:
					Analytics.trackEvent(this.trackingLabel || 'Video Ad', 'No Ad', e.getMessage());
					break;

				case 403:
					Analytics.trackEvent(
						this.trackingLabel || 'Video Ad',
						'Invalid Ad Format',
						e.getMessage()
					);
					break;

				default:
					Analytics.trackEvent(
						this.trackingLabel || 'Video Ad',
						'Ad Error',
						e.getErrorCode() + ' - ' + e.getMessage()
					);
			}
		}

		this.cleanup();
		this.$emit('ad-shown');
	}

	beforeDestroy() {
		this.cleanup();
	}

	private bootstrap() {
		const ima: any = (window as any).google.ima;

		return new Promise<any>((resolve, reject) => {
			this.videoElem = this.$el.getElementsByTagName('video')[0] as HTMLVideoElement;
			this.adContainerElem = this.$el.getElementsByClassName(
				'ad-video-player-ad-container'
			)[0] as HTMLElement;

			// Iinitialize the ad container.
			const adDisplayContainer = new ima.AdDisplayContainer(this.adContainerElem, this.videoElem);
			adDisplayContainer.initialize();

			// Set up an ads loader.
			const adsLoader = new ima.AdsLoader(adDisplayContainer);
			adsLoader.getSettings().setVpaidAllowed(true, resolve, reject);

			adsLoader.addEventListener(
				ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
				(event: any) => this.onAdLoaded(event, resolve, reject),
				false
			);

			adsLoader.addEventListener(
				ima.AdErrorEvent.Type.AD_ERROR,
				(event: any) => this.onAdError(event, reject),
				false
			);

			const adsRequest = new ima.AdsRequest();
			if (Environment.env === 'development') {
				adsRequest.adTagUrl =
					'https://pubads.g.doubleclick.net/gampad/ads?' +
					'sz=640x360&iu=/6062/iab_vast_samples/skippable&ciu_szs=300x250,728x90&' +
					'impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1&' +
					'url=[referrer_url]&correlator=[timestamp]';
			} else {
				adsRequest.adTagUrl =
					'https://pubads.g.doubleclick.net/gampad/ads' +
					'?sz=854x480&iu=/27005478/web-video-browser&ciu_szs=300x60,300x250,728x90' +
					'&impl=s&gdfp_req=1&env=vp&output=xml_vast2&unviewed_position_start=1' +
					'&url=[referrer_url]&correlator=[timestamp]' +
					'&cust_params=' +
					encodeURIComponent('ref_url=' + encodeURIComponent(window.location.href));
			}

			adsRequest.linearAdSlotWidth = AdSlotWidth;
			adsRequest.linearAdSlotHeight = AdSlotHeight;

			// This'll start the ads request process.
			// Will either call onAdError or onAdLoaded.
			adsLoader.requestAds(adsRequest);
		});
	}

	private onAdLoaded(event: any, resolve: any, reject: any) {
		const ima: any = (window as any).google.ima;

		this.adsManager = event.getAdsManager(this.videoElem);

		// Set up all the events.
		this.adsManager.addEventListener(ima.AdErrorEvent.Type.AD_ERROR, (_event: any) =>
			this.onAdError(_event, reject)
		);

		this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, () => {
			this.videoElem.pause();
			this.isAdPlaying = true;
		});

		this.adsManager.addEventListener(ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
			this.videoElem.play();
			this.isAdPlaying = false;
		});

		this.adsManager.addEventListener(ima.AdEvent.Type.STARTED, () => {
			Analytics.trackEvent(this.trackingLabel || 'Video Ad', 'Started', 'IMA');

			this.isLoading = false;
			this.updateTimeRemaining();
			this.remainingInterval = window.setInterval(() => this.updateTimeRemaining(), 1000);
		});

		this.adsManager.addEventListener(ima.AdEvent.Type.IMPRESSION, () => {
			Ads.sendBeacon(Ads.EVENT_VIEW, Ads.TYPE_VIDEO, this.resource, this.resourceId);
		});

		this.adsManager.addEventListener(ima.AdEvent.Type.CLICK, () => {
			Analytics.trackEvent(this.trackingLabel || 'Video Ad', 'Clicked', 'IMA');
			this.toggle();
		});

		this.adsManager.addEventListener(ima.AdEvent.Type.SKIPPED, () => {
			Analytics.trackEvent(this.trackingLabel || 'Video Ad', 'Skipped', 'IMA');
			resolve();
		});

		this.adsManager.addEventListener(ima.AdEvent.Type.COMPLETE, () => {
			Analytics.trackEvent(this.trackingLabel || 'Video Ad', 'Completed', 'IMA');
			resolve();
		});

		try {
			this.adsManager.init(910, 512, ima.ViewMode.NORMAL);
			this.adsManager.start();
		} catch (adError) {
			reject(adError);
		}
	}

	private updateTimeRemaining() {
		this.timeRemaining = this.adsManager.getRemainingTime();
	}

	private onAdError(event: any, reject: any) {
		reject(event.getError());
	}

	toggle() {
		if (this.isAdPlaying) {
			this.adsManager.pause();
			this.isAdPlaying = false;
		} else {
			this.adsManager.resume();
			this.isAdPlaying = true;
		}
	}

	private cleanup() {
		if (this.adsManager) {
			this.adsManager.destroy();
		}

		if (this.remainingInterval) {
			window.clearInterval(this.remainingInterval);
		}
	}
}
