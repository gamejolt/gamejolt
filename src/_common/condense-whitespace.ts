import { h } from 'vue';
import { Options, Vue } from 'vue-property-decorator';

/**
 * Since our tools will autoformat the HTML templates, it can sometimes screw up
 * styling where whitespace matters. Wrapping with this component will remove
 * all whitespace/comment nodes so that styling only touches the real elements.
 */
@Options({})
export class AppCondenseWhitespace extends Vue {
	render() {
		// TODO(vue3): I'm not sure what the new attribute is for getting the text yet.
		const children = this.$slots
			.default?.()
			.filter(i => !!i.children || (i.text || '').trim() !== '');

		return h('div', {}, children);
	}
}
