<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppContentEmbedSketchfab extends Vue {
	@Prop(String)
	modelId!: string;

	get embedSrc() {
		return `https://sketchfab.com/models/${this.modelId}/embed?camera=0`;
	}
}
</script>

<template>
	<iframe
		width="100%"
		height="400px"
		scrolling="no"
		frameborder="no"
		allow="autoplay; fullscreen; vr"
		mozallowfullscreen="true"
		webkitallowfullscreen="true"
		sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
		:src="embedSrc"
	/>
</template>
