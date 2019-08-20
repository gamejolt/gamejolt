import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppContentEmbedSketchfab extends Vue {
	@Prop(String)
	modelId!: string;

	get embedSrc() {
		return `https://sketchfab.com/models/${this.modelId}/embed?camera=0`;
	}
}
