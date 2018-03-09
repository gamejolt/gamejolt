import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./widget.html';

import { GrecaptchaSdk } from '../sdk/sdk.service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';

@View
@Component({
	components: {
		AppLoading,
	},
})
export class AppGrecaptchaWidget extends Vue {
	@Prop({ type: String, default: 'dark' })
	theme: 'light' | 'dark';
	@Prop({ type: String, default: 'image' })
	type: 'image' | 'audio';
	@Prop({ type: String, default: 'normal' })
	size: 'normal' | 'compact' | 'invisible';
	@Prop({ type: String, default: 'bottomright' })
	badgeLocation: 'bottomright' | 'bottomleft' | 'inline';

	resetting = false;
	loaded = false;
	valid = false;
	widgetId = 0;

	$refs: { grecaptcha: HTMLDivElement };

	get loadedAndValid() {
		return this.loaded && this.valid;
	}

	mounted() {
		this.init();
	}

	@Watch('theme')
	@Watch('type')
	@Watch('size')
	@Watch('badgePosition')
	changed() {
		this.init();
	}

	reset() {
		if (!this.loadedAndValid) {
			return;
		}

		grecaptcha.reset(this.widgetId);
	}

	private async init() {
		if (this.resetting) {
			return;
		}

		this.resetting = true;
		try {
			await GrecaptchaSdk.load();
			console.log('window.grecaptcha exists: ' + !!window.grecaptcha);
			this.valid = true;
		} catch (err) {
			console.error(err);
		}
		this.loaded = true;

		if (!this.valid) {
			return;
		}

		// Wait one tick to give the captcha element a chance to load in.
		await this.$nextTick();

		this.widgetId = grecaptcha.render(this.$refs.grecaptcha, {
			sitekey: Environment.recaptchaSiteKey,
			theme: this.theme,
			type: this.type,
			size: this.size,
			badge: this.badgeLocation,
			callback: response => this.$emit('response', response),
			'expired-callback': () => this.$emit('expired'),
		});
		this.resetting = false;
	}
}
