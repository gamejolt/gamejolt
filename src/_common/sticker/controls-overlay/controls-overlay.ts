import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppStickerControlsOverlay extends Vue {
	// Extends the overlay 4px past the content on the bottom,
	// rather than being inset 4px on the bottom.
	@Prop({ type: Boolean, default: false }) end!: boolean;
}
