<script lang="ts">
import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { GrecaptchaSdk } from '../sdk/sdk.service';

@Options({
	components: {
		AppLoading,
	},
})
export default class AppGrecaptchaWidget extends Vue {
	@Prop({ type: String, default: 'dark' })
	theme!: 'light' | 'dark';

	@Prop({ type: String, default: 'image' })
	type!: 'image' | 'audio';

	@Prop({ type: String, default: 'normal' })
	size!: 'normal' | 'compact' | 'invisible';

	@Prop({ type: String, default: 'bottomright' })
	badgeLocation!: 'bottomright' | 'bottomleft' | 'inline';

	resetting = false;
	loaded = false;
	valid = false;
	widgetId = 0;

	declare $refs: { grecaptcha: HTMLDivElement };

	@Emit('response')
	emitResponse(_response: string) {}

	@Emit('expired')
	emitExpired() {}

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
		await nextTick();

		this.widgetId = grecaptcha.render(this.$refs.grecaptcha, {
			sitekey: Environment.recaptchaSiteKey,
			theme: this.theme,
			type: this.type,
			size: this.size,
			badge: this.badgeLocation,
			callback: response => this.emitResponse(response),
			'expired-callback': () => this.emitExpired(),
		});
		this.resetting = false;
	}
}
</script>

<template>
	<span>
		<AppLoading v-if="!loaded" />
		<div v-else ref="grecaptcha">
			<AppTranslate v-if="!loadedAndValid">
				We could not load in Google's captcha widget.
			</AppTranslate>
		</div>
	</span>
</template>
