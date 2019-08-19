import { Node } from 'prosemirror-model';
import { isChildElement } from '../../../../utils/dom';
import AppContentEmbed from '../../components/embed/embed.vue';
import { ContentEditorService } from '../content-editor.service';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { HydratableNodeView } from './hydratable';

export class EmbedNodeView extends HydratableNodeView {
	private vueComponent: AppContentEmbed | undefined;

	// Stops input events from prosemirror reaching the custom <input> element in our embed component.
	// We capture the inputs ourselves.
	stopEvent(e: Event) {
		return e.target instanceof HTMLInputElement && isChildElement(this.dom, e.target);
	}

	update(node: Node<ContentEditorSchema>) {
		this.node = node;
		// Update the vue component's props from the new node
		if (this.vueComponent instanceof AppContentEmbed) {
			this.vueComponent!.$props.source = this.node.attrs.source;
			this.vueComponent!.$props.type = this.node.attrs.type;
		}
		// Don't handle updates to this node, so it doesn't get redrawn.
		return !node.attrs.type;
	}

	mounted() {
		this.vueComponent = new AppContentEmbed({
			propsData: {
				type: this.node.attrs.type,
				source: this.node.attrs.source,
				owner: this.owner,
				isDisabled: ContentEditorService.isDisabled(this.view),
			},
		});
		this.mountVue(this.vueComponent);
	}
}
