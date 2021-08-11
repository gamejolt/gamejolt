import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export class AppContentViewerHorizontalRule extends Vue {
	render() {
		return h('hr');
	}
}
