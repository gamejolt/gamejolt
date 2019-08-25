import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

@Component({})
export class AppContentViewerHorizontalRule extends Vue {
	render(h: CreateElement) {
		return h('hr');
	}
}
