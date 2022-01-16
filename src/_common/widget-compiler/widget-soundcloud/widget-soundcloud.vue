<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppWidgetCompilerWidgetSoundcloud extends Vue {
	@Prop({ type: String, default: '' })
	trackId!: string;
	@Prop({ type: String, default: '' })
	color!: string;

	embedSrc = '';

	created() {
		this.embedSrc =
			'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' +
			this.trackId;

		if (this.color) {
			this.embedSrc += '&amp;color=' + this.color;
		}
	}
}
</script>

<template>
	<iframe
		class="widget-compiler-widget-soundcloud"
		nwdisable
		nwfaketop
		width="100%"
		height="166"
		scrolling="no"
		frameborder="no"
		:src="embedSrc"
	></iframe>
</template>

<style lang="stylus" scoped>
.widget-compiler-widget-soundcloud
	display: block
	margin-bottom: $line-height-computed
</style>
