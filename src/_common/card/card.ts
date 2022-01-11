import { Options, Prop, Vue } from 'vue-property-decorator';
import './card.styl';

@Options({})
export default class AppCard extends Vue {
	@Prop({ type: Boolean, default: false }) isDraggable!: boolean;
	@Prop({ type: Boolean, default: false }) isExpandable!: boolean;
	@Prop({ type: Boolean, default: false }) isExpanded!: boolean;
	@Prop({ type: Boolean, default: false }) isInactive!: boolean;
	@Prop({ type: Boolean, default: false }) isDisabled!: boolean;

	/** Takes up the padding that would show as if this card was expandable. */
	@Prop({ type: Boolean, default: false }) forceExpandablePadding!: boolean;
}
