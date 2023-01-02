import { Mark, MarkType, Node } from 'prosemirror-model';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { ContentEditorController, editorResolveNodePosition } from '../content-editor-controller';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { UrlDetector } from './url-detector';

type RegexResult = {
	index: number;
	match: string;
};

type TextCell = {
	index: number;
	text: string;
};

export default class UpdateAutolinkPlugin extends Plugin {
	constructor(private readonly c: ContentEditorController) {
		super({});

		this.spec.appendTransaction = this.appendTransaction;
	}

	get capabilities() {
		return this.c.contextCapabilities;
	}

	appendTransaction(
		_transactions: Transaction<ContentEditorSchema>[],
		oldState: EditorState<ContentEditorSchema>,
		newState: EditorState<ContentEditorSchema>
	) {
		const tr = newState.tr;
		const marks = this.c.view!.state.schema.marks;

		const mentionMarkType = marks.mention;
		const tagMarkType = marks.tag;
		const linkMarkType = marks.link;

		const paragraphs = this.getParagraphs(tr.doc);

		// @username should create a mention
		// #tag should create a tag
		// c/community should link a community
		// urls should be autolinked

		for (const paragraph of paragraphs) {
			const paragraphPos = editorResolveNodePosition(this.c, paragraph, newState);

			// Check if the paragraph changed compared to the last state.
			// -1 to not include the doc node.
			if (oldState.doc.nodeSize - 1 >= paragraphPos) {
				const oldParagraph = oldState.doc.nodeAt(paragraphPos);
				if (oldParagraph instanceof Node && oldParagraph.eq(paragraph)) {
					continue;
				}
			}

			if (this.capabilities.mention) {
				tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, mentionMarkType);
			}
			if (this.capabilities.tag) {
				tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, tagMarkType);
			}
			if (this.capabilities.textLink) {
				this.removeAutolinkMarks(tr, paragraphPos, paragraph);
			}

			// We split the paragraph's inline nodes into text cells.
			// These text cells contain only text nodes and are split at positions that hold inline nodes that aren't text.
			// Example: @Hello🦀@World, where the emoji is a gj-emoji inline node.
			// This would produce two text cells, one with "@Hello", one with "@World".
			const cells = this.getTextCells(paragraph);

			for (const cell of cells) {
				// These have to be processed in this order, because links have to have preceedens over mentions:
				// `gamejolt.com/@user` would become an autolink, and not a mention when processing links first.

				if (this.capabilities.textLink) {
					this.processLinks(tr, cell, linkMarkType, paragraphPos);
				}
				if (this.capabilities.mention) {
					this.processMentions(tr, cell, mentionMarkType, paragraphPos);
				}
				if (this.capabilities.tag) {
					this.processTags(tr, cell, tagMarkType, paragraphPos);
				}
			}
		}

		return tr;
	}

	/**
	 * Checks whether the given range (from - to) has one of the three mark types attached to it:
	 *  - mention
	 *  - tag
	 *  - link
	 */
	rangeHasLinks(tr: Transaction<ContentEditorSchema>, from: number, to: number) {
		const marks = this.c.view!.state.schema.marks;
		// Ensure that our list of markTypes contains valid values.
		//
		// Depending on the context this editor is used, it may not have access
		// to marks like `links`. This can happen if links are disabled in a
		// Fireside.
		const markTypes = [marks.mention, marks.tag, marks.link].filter(i => !!i);
		for (const markType of markTypes) {
			if (tr.doc.rangeHasMark(from, to, markType)) {
				return true;
			}
		}
		return false;
	}

	processTags(
		tr: Transaction<ContentEditorSchema>,
		cell: TextCell,
		markType: MarkType<ContentEditorSchema>,
		paragraphPos: number
	) {
		const matches = [] as RegexResult[];
		const regex = /(?:^|[^a-z0-9_])(#[a-z0-9_]{1,30})/gi;

		let cellMatch = regex.exec(cell.text);
		while (cellMatch !== null) {
			// Make sure the tag starts with the '#' character.
			const tagIndex = cellMatch[0].indexOf('#');
			cellMatch[0] = cellMatch[0].substr(tagIndex);
			cellMatch.index += tagIndex;

			matches.push({
				index: cell.index + cellMatch.index + 1, // +1 to skip the paragraph node index
				match: cellMatch[0],
			});

			cellMatch = regex.exec(cell.text);
		}

		for (const match of matches) {
			const from = paragraphPos + match.index;
			const to = from + match.match.length;
			// Make sure to only apply a tag mark if the given range does not already have a link/mention/tag mark on it.
			if (!this.rangeHasLinks(tr, from, to)) {
				const mark = markType.create({ tag: match.match.substr(1) });
				tr.addMark(from, to, mark);
			}
		}
	}

	processMentions(
		tr: Transaction<ContentEditorSchema>,
		cell: TextCell,
		markType: MarkType<ContentEditorSchema>,
		paragraphPos: number
	) {
		const matches = [] as RegexResult[];
		const regex = /(?:^|[^\w@_-])(@[\w_-]{3,30})/gi;

		let cellMatch = regex.exec(cell.text);
		while (cellMatch !== null) {
			// Make sure the mention starts with the '@' character.
			const atIndex = cellMatch[0].indexOf('@');
			cellMatch[0] = cellMatch[0].substr(atIndex);
			cellMatch.index += atIndex;

			matches.push({
				index: cell.index + cellMatch.index + 1, // +1 to skip the paragraph node index
				match: cellMatch[0],
			});

			cellMatch = regex.exec(cell.text);
		}

		for (const match of matches) {
			const from = paragraphPos + match.index;
			const to = from + match.match.length;
			// Make sure to only apply a mention mark if the given range does not already have a link/mention/tag mark on it.
			if (!this.rangeHasLinks(tr, from, to)) {
				const mark = markType.create({ username: match.match.substr(1) });
				tr.addMark(from, to, mark);
			}
		}
	}

	processLinks(
		tr: Transaction<ContentEditorSchema>,
		cell: TextCell,
		markType: MarkType<ContentEditorSchema>,
		paragraphPos: number
	) {
		const matches = UrlDetector.detect(cell.text, cell.index + 1); // +1 to skip the paragraph node index

		for (const match of matches) {
			const from = paragraphPos + match.index;
			const to = from + match.match.length;
			// Make sure to only apply a link mark if the given range does not already have a link/mention/tag mark on it.
			if (!this.rangeHasLinks(tr, from, to)) {
				const mark = markType.create({
					href: match.match,
					title: match.match,
					autolink: true,
				});
				tr.addMark(from, to, mark);
			}
		}
	}

	removeAutolinkMarks(
		tr: Transaction<ContentEditorSchema>,
		paragraphPos: number,
		paragraph: Node<ContentEditorSchema>
	) {
		const autolinkMarks = [] as Mark[];
		paragraph.descendants((node: Node<ContentEditorSchema>, _pos: number, _parent: Node) => {
			if (node.isText) {
				autolinkMarks.push(
					...node.marks.filter(m => m.type.name === 'link' && m.attrs.autolink)
				);
			}
		});

		for (const autolinkMark of autolinkMarks) {
			tr.removeMark(paragraphPos, paragraphPos + paragraph.nodeSize, autolinkMark);
		}
	}

	getParagraphs(parent: Node<ContentEditorSchema>): Node<ContentEditorSchema>[] {
		const paragraphs = [] as Node<ContentEditorSchema>[];

		for (let i = 0; i < parent.childCount; i++) {
			const child = parent.child(i);
			if (child.type.name === 'paragraph') {
				paragraphs.push(child);
			} else {
				paragraphs.push(...this.getParagraphs(child));
			}
		}

		return paragraphs;
	}

	getTextCells(parent: Node<ContentEditorSchema>): TextCell[] {
		const cells = [] as TextCell[];
		let currentCell = { index: 0, text: '' } as TextCell;

		for (let i = 0; i < parent.childCount; i++) {
			const child = parent.child(i);
			if (child.isText && child.marks.every(m => m.type.name !== 'code')) {
				currentCell.text += child.text;
			} else {
				if (currentCell.text.length > 0) {
					cells.push(currentCell);
				}
				currentCell = {
					index: currentCell.index + child.nodeSize + currentCell.text.length,
					text: '',
				};
			}
		}

		if (currentCell.text.length > 0) {
			cells.push(currentCell);
		}

		return cells;
	}
}
