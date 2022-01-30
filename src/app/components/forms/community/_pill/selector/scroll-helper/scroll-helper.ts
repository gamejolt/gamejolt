import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../../../utils/vue';
import { useScroller } from '../../../../../../../_common/scroll/AppScrollScroller.vue';

@Options({})
export class AppScrollHelper extends Vue {
	@Prop({ type: Boolean, default: false })
	when!: boolean;

	scrollParent = shallowSetup(() => useScroller());

	@Watch('when')
	onContentChange() {
		this.scrollParent?.scrollTo(0);
	}

	render() {
		return h('div');
	}
}
