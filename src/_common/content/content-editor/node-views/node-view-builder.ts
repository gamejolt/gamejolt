import { Node } from 'prosemirror-model';
import { Decoration, EditorView, NodeView } from 'prosemirror-view';

import { ContentEditorController } from '~common/content/content-editor/content-editor-controller';
import { CustomButtonNodeView } from '~common/content/content-editor/node-views/custom-button';
import { EmbedNodeView } from '~common/content/content-editor/node-views/embed';
import { EmojiNodeView } from '~common/content/content-editor/node-views/emoji';
import { GifNodeView } from '~common/content/content-editor/node-views/gif';
import { MediaItemNodeView } from '~common/content/content-editor/node-views/media-item';
import { MediaUploadNodeView } from '~common/content/content-editor/node-views/media-upload';
import { ContentEditorSchema } from '~common/content/content-editor/schemas/content-editor-schema';

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
	if (capabilities.emoji) {
		nodeViews.gjEmoji = function (node, view, getPos) {
			return new EmojiNodeView(c, node, view, getPos);
		};
	}
	if (capabilities.customButton) {
		nodeViews.customButton = function (node, view, getPos) {
			return new CustomButtonNodeView(c, node, view, getPos);
		};
	}

	return nodeViews;
}
