import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

@Component({})
export class AppContentViewerHardBreak extends Vue {
	render(h: CreateElement) {
		return h('br');
	}
}
