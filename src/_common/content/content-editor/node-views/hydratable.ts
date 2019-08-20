import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { ContentOwner } from '../../content-owner';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { BaseNodeView, GetPosFunction } from './base';

export abstract class HydratableNodeView extends BaseNodeView {
	protected owner: ContentOwner;

	constructor(
		node: Node<ContentEditorSchema>,
		view: EditorView<ContentEditorSchema>,
		getPos: GetPosFunction,
		owner: ContentOwner
	) {
		super(node, view, getPos);

		this.owner = owner;
	}
}
