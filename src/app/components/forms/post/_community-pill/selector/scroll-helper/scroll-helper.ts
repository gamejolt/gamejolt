import { h } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../../../../../utils/vue';
import { useScroller } from '../../../../../../../_common/scroll/scroller/scroller.vue';

@Options({})
export class AppScrollHelper extends Vue {
	@Prop(propOptional(Boolean, false))
	when!: boolean;

	scrollParent = setup(() => useScroller());

	@Watch('when')
	onContentChange() {
		this.scrollParent?.scrollTo(0);
	}

	render() {
		return h('div');
	}
}
