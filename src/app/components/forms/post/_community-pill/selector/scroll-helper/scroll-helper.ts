import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { findRequiredVueParent, propOptional } from '../../../../../../../utils/vue';
import AppScrollScrollerTS from '../../../../../../../_common/scroll/scroller/scroller';
import AppScrollScroller from '../../../../../../../_common/scroll/scroller/scroller.vue';

@Options({})
export class AppScrollHelper extends Vue {
	@Prop(propOptional(Boolean, false))
	when!: boolean;

	scrollParent!: AppScrollScrollerTS;

	mounted() {
		this.scrollParent = findRequiredVueParent<AppScrollScrollerTS>(this, AppScrollScroller);
	}

	@Watch('when')
	onContentChange() {
		this.scrollParent.scrollTo(0);
	}

	render() {
		return h('div');
	}
}
