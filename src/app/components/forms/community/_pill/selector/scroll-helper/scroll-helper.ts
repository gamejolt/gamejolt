import { h, ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { useScroller } from '../../../../../../../_common/scroll/scroller/scroller.vue';

@Options({})
export class AppScrollHelper extends Vue {
	@Prop({ type: Boolean, default: false })
	when!: boolean;

	scrollParent = setup(() => ref(useScroller()));

	@Watch('when')
	onContentChange() {
		this.scrollParent?.scrollTo(0);
	}

	render() {
		return h('div');
	}
}
