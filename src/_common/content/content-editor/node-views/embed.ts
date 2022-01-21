import { Node } from 'prosemirror-model';
import { isChildElement } from '../../../../utils/dom';
import AppContentEmbed from '../../components/embed/AppContentEmbed.vue';
import { ContentEditorService } from '../content-editor.service';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { BaseNodeView, NodeViewRenderData } from './base';

export class EmbedNodeView extends BaseNodeView {
	private props: NodeViewRenderData['props'] = {};

	// Stops input events from prosemirror reaching the custom <input> element
	// in our embed component. We capture the inputs ourselves.
	stopEvent(e: Event) {
		return e.target instanceof HTMLInputElement && isChildElement(this.dom, e.target);
	}

	mounted() {
		this.props = {
			type: this.node.attrs.type,
			source: this.node.attrs.source,
			isDisabled: ContentEditorService.isDisabled(this.view),
		};

		this.mountVue(AppContentEmbed, this.props);
	}

	update(node: Node<ContentEditorSchema>) {
		this.node = node;

		// Update the vue component's props from the new node
		this.props.source = this.node.attrs.source;
		this.props.type = this.node.attrs.type;

		// Don't handle updates to this node, so it doesn't get redrawn.
		return !node.attrs.type;
	}
}
