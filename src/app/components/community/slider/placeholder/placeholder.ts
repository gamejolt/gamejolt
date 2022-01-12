import { Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppCommunitySliderPlaceholder extends Vue {
	// How many community placeholders we want, not including Add or Discover.
	@Prop({ type: Number, required: true })
	num!: number;

	/**
	 * Adds a second non-community bubble
	 * if we want the 'add' placeholder to show.
	 */
	@Prop({ type: Boolean, default: false })
	withAddButton!: number;
}
