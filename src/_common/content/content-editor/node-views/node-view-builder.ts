import { Node } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { ContentOwner } from '../../content-owner';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { EmbedNodeView } from './embed';
import { GifNodeView } from './gif';
import { MediaItemNodeView } from './media-item';
import { MediaUploadNodeView } from './media-upload';

type NodeViewList = {
	[name: string]: (
		node: Node<ContentEditorSchema>,
		view: EditorView<ContentEditorSchema>,
		getPos: () => number,
		decorations: Decoration[]
	) => NodeView<ContentEditorSchema>;
};

export function buildNodeViews(owner: ContentOwner): NodeViewList {
	// Construct node views based on capabilities
	const nodeViews = {} as NodeViewList;
	const capabilities = owner.getCapabilities();

	if (capabilities.hasAnyEmbed) {
		nodeViews.embed = function(node, view, getPos) {
			return new EmbedNodeView(node, view, getPos, owner);
		};
	}
	if (capabilities.media) {
		nodeViews.mediaItem = function(node, view, getPos) {
			return new MediaItemNodeView(node, view, getPos, owner);
		};
		nodeViews.mediaUpload = function(node, view, getPos) {
			return new MediaUploadNodeView(node, view, getPos, owner);
		};
	}
	if (capabilities.gif) {
		nodeViews.gif = function(node, view, getPos) {
			return new GifNodeView(node, view, getPos);
		};
	}

	return nodeViews;
}
