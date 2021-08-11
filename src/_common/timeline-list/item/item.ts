import { Options, Prop, Vue } from 'vue-property-decorator';
import './item-content.styl';

@Options({})
export default class AppTimelineListItem extends Vue {
	@Prop(Boolean)
	isActive?: boolean;

	@Prop(Boolean)
	isNew?: boolean;

	@Prop(Boolean)
	isThread?: boolean;

	@Prop(Boolean)
	isLast?: boolean;
}
