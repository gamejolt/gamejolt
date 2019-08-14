import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';

/**
 * Since our tools will autoformat the HTML templates, it can sometimes screw up
 * styling where whitespace matters. Wrapping with this component will remove
 * all whitespace/comment nodes so that styling only touches the real elements.
 */
@Component({})
export class AppCondenseWhitespace extends Vue {
	render(h: CreateElement) {
		let children = this.$slots.default;
		if (children) {
			children = children.filter(i => !!i.children || (i.text || '').trim() !== '');
		}

		return h('div', children);
	}
}
