import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppContentEmbedSketchfab extends Vue {
	@Prop(String)
	modelId!: string;

	get embedSrc() {
		return `https://sketchfab.com/models/${this.modelId}/embed?camera=0`;
	}
}
