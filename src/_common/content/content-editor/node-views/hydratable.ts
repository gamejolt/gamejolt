import { Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { ContentOwnerController } from '../../content-owner';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { BaseNodeView, GetPosFunction } from './base';

export abstract class HydratableNodeView extends BaseNodeView {
	protected owner: ContentOwnerController;

	constructor(
		node: Node<ContentEditorSchema>,
		view: EditorView<ContentEditorSchema>,
		getPos: GetPosFunction,
		owner: ContentOwnerController
	) {
		super(node, view, getPos);

		this.owner = owner;
	}
}
