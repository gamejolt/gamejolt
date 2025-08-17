import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { ContextCapabilities } from '../../content-context';
import { ContentObjectType } from '../../content-object';
import { customLink, link } from './specs/marks/link-markspec';
import { mention } from './specs/marks/mention-markspec';
import { strike } from './specs/marks/strike-markspec';
import { tag } from './specs/marks/tag-markspec';
import { blockquote } from './specs/nodes/blockquote-nodespec';
import { bulletList } from './specs/nodes/bullet-list-nodespec';
import { codeBlock } from './specs/nodes/code-block-nodespec';
import { customButton } from './specs/nodes/custom-button-nodespec';
import { embed } from './specs/nodes/embed-nodespec';
import { gif } from './specs/nodes/gif-nodespec';
import { gjEmoji } from './specs/nodes/gj-emoji-nodespec';
import { hardBreak } from './specs/nodes/hard-break-nodespec';
import { heading } from './specs/nodes/heading-nodespec';
import { hr } from './specs/nodes/hr-nodespec';
import { listItem } from './specs/nodes/list-item-nodespec';
import { mediaItem } from './specs/nodes/media-item-nodespec';
import { mediaUpload } from './specs/nodes/media-upload-nodespec';
import { orderedList } from './specs/nodes/ordered-list-nodespec';
import { paragraph } from './specs/nodes/paragraph-nodespec';
import { spoiler } from './specs/nodes/spoiler-nodespec';

export class ContentEditorSchema extends Schema<
	| 'text'
	| 'paragraph'
	| 'hardBreak'
	| 'gjEmoji'
	| 'mediaItem'
	| 'mediaUpload'
	| 'embed'
	| 'codeBlock'
	| 'blockquote'
	| 'listItem'
	| 'bulletList'
	| 'orderedList'
	| 'hr'
	| 'spoiler'
	| 'heading'
	| 'gif'
	| 'customButton',
	'strong' | 'em' | 'code' | 'link' | 'strike' | 'mention' | 'tag'
> {}

export function generateEditorSchema(capabilities: ContextCapabilities) {
	return new ContentEditorSchema({
		nodes: generateNodes(capabilities),
		marks: generateMarks(capabilities),
	});
}

function generateNodes(capabilities: ContextCapabilities) {
	const nodes = {
		text: {
			group: 'inline',
		},
		paragraph,
		hardBreak,
		doc: {
			content: 'block*',
		},
	} as any;

	const allowedDocNodes = ['paragraph'] as ContentObjectType[];

	if (capabilities.emoji) {
		nodes.gjEmoji = gjEmoji;
	}
	if (capabilities.media) {
		nodes.mediaItem = mediaItem;
		nodes.mediaUpload = mediaUpload;
	}
	if (capabilities.hasAnyEmbed) {
		nodes.embed = embed;
	}
	if (capabilities.codeBlock) {
		nodes.codeBlock = codeBlock;
	}
	if (capabilities.blockquote) {
		nodes.blockquote = blockquote;
	}
	if (capabilities.list) {
		nodes.listItem = listItem;
		nodes.bulletList = bulletList;
		nodes.orderedList = orderedList;

		allowedDocNodes.push('bulletList', 'orderedList');
	}
	if (capabilities.hr) {
		nodes.hr = hr;
	}
	if (capabilities.spoiler) {
		nodes.spoiler = spoiler;

		allowedDocNodes.push('spoiler');
	}
	if (capabilities.heading) {
		nodes.heading = heading;

		allowedDocNodes.push('heading');
	}
	if (capabilities.gif) {
		nodes.gif = gif;
	}
	if (capabilities.customButton) {
		nodes.customButton = customButton;
	}

	if (allowedDocNodes.length > 0) {
		nodes.doc.content += ' (' + allowedDocNodes.join(' | ') + ')';
	}

	return nodes;
}

function generateMarks(capabilities: ContextCapabilities) {
	const marks = {} as any;

	if (capabilities.textBold) {
		marks.strong = basicSchema.marks.strong.spec;
	}
	if (capabilities.textItalic) {
		marks.em = basicSchema.marks.em.spec;
	}
	if (capabilities.textCode) {
		marks.code = basicSchema.marks.code.spec;
	}
	if (capabilities.textLink) {
		if (capabilities.customLink) {
			marks.link = customLink;
		} else {
			marks.link = link;
		}
	}
	if (capabilities.textStrike) {
		marks.strike = strike;
	}
	if (capabilities.mention) {
		marks.mention = mention;
	}
	if (capabilities.tag) {
		marks.tag = tag;
	}

	return marks;
}
