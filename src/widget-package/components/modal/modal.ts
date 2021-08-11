import { Options, Prop, Vue } from 'vue-property-decorator';
import AppScrollScroller from '../../../_common/scroll/scroller/scroller.vue';

@Options({
	components: {
		AppScrollScroller,
	},
})
export default class AppModal extends Vue {
	@Prop(Boolean) hideClose!: boolean;

	close() {
		this.$emit('close');
	}
}
