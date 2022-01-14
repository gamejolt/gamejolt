<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';

@Options({})
export default class AppEmbedFlash extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State username!: Store['username'];
	@State token!: Store['token'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];

	get query() {
		if (this.username && this.token) {
			return `?gjapi_username=${this.username}&gjapi_token=${this.token}`;
		}
		return '';
	}
}
</script>

<template>
	<div style="margin: 0 auto; text-align: center">
		<object
			type="application/x-shockwave-flash"
			:data="url"
			:width="embedWidth"
			:height="embedHeight"
		>
			<param name="allowFullScreen" value="true" />
			<param name="allowFullScreenInteractive" value="true" />
			<param name="wmode" value="direct" />
			<param name="flashvars" :value="encodeURIComponent(query)" />

			<p>
				<translate>You need Adobe Flash player installed to play this game.</translate>
				<br />
				<translate>You may use the button below to get it.</translate>
			</p>

			<app-link-external href="https://www.adobe.com/go/getflash">
				<img
					src="https://www.adobe.com/images/shared/download_buttons/get_flash_player.gif"
					alt="Get Adobe Flash player"
					style="border-style: none"
				/>
			</app-link-external>
		</object>
	</div>
</template>
