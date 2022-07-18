import { Node } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';
import { ContentEditorController } from '../content-editor-controller';
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

export function buildEditorNodeViews(c: ContentEditorController): NodeViewList {
	// Construct node views based on capabilities
	const nodeViews = {} as NodeViewList;
	const capabilities = c.contextCapabilities;

	if (capabilities.hasAnyEmbed) {
		nodeViews.embed = function (node, view, getPos) {
			return new EmbedNodeView(c, node, view, getPos);
		};
	}
	if (capabilities.media) {
		nodeViews.mediaItem = function (node, view, getPos) {
			return new MediaItemNodeView(c, node, view, getPos);
		};
		nodeViews.mediaUpload = function (node, view, getPos) {
			return new MediaUploadNodeView(c, node, view, getPos);
		};
	}
	if (capabilities.gif) {
		nodeViews.gif = function (node, view, getPos) {
			return new GifNodeView(c, node, view, getPos);
		};
	}

	return nodeViews;
}
