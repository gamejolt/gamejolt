import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';

@Options({})
export class AppContentViewerHardBreak extends Vue {
	render() {
		return h('br');
	}
}
