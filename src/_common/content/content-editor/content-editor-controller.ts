import { lift, toggleMark, wrapIn } from 'prosemirror-commands';
import { Fragment, Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { EditorState, Plugin, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { InjectionKey, MaybeRef, inject, markRaw, nextTick, reactive, unref, watch } from 'vue';
import { isImage } from '../../../utils/image';
import { uuidv4 } from '../../../utils/uuid';
import { GJ_EMOJIS } from '../../emoji/AppEmoji.vue';
import { EmojiModel } from '../../emoji/emoji.model';
import { MediaItemModel } from '../../media-item/media-item-model';
import { ContentContext, ContextCapabilities } from '../content-context';
import { ContentDocument } from '../content-document';
import { ContentFormatAdapter, ProsemirrorEditorFormat } from '../content-format-adapter';
import { ContentOwnerController } from '../content-owner';
import { ContentEditorAppAdapterMessage, editorGetAppAdapter } from './app-adapter';
import { ContentEditorService } from './content-editor.service';
import buildEditorEvents from './events/build-events';
import { MediaUploadTask, createMediaUploadTask } from './media-upload-task';
import { SearchResult } from './modals/gif/gif-modal.service';
import { NodeViewRenderData } from './node-views/base';
import { buildEditorNodeViews } from './node-views/node-view-builder';
import { BasicMentionRegex } from './plugins/input-rules';
import { createEditorPlugins } from './plugins/plugins';
import { ContentEditorSchema, generateEditorSchema } from './schemas/content-editor-schema';

export const ContentEditorControllerKey: InjectionKey<ContentEditorController> = Symbol(
	'content-editor-controller'
);

export function useContentEditorController() {
	return inject(ContentEditorControllerKey, null);
}

type Coordinates = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export function createContentEditor(options: {
	contentContext: ContentContext;
	singleLineMode?: MaybeRef<boolean>;
	disabled?: MaybeRef<boolean>;
	contextCapabilities: ContextCapabilities;
}): ContentEditorController {
	const { contentContext, singleLineMode, disabled } = options;

	const c = reactive(new ContentEditorController(contentContext)) as ContentEditorController;

	c.contextCapabilities = markRaw(options.contextCapabilities);
	c.schema = markRaw(generateEditorSchema(c.contextCapabilities));
	c.plugins = markRaw(createEditorPlugins(c));

	// Sync over props into our controller.

	watch(
		() => unref(singleLineMode),
		newVal => (c.singleLineMode = newVal ?? false),
		{ immediate: true }
	);

	watch(
		() => unref(disabled),
		newVal => (c.disabled = newVal ?? false),
		{ immediate: true }
	);

	// When stateCounter updates, we want to sync the scope, because something
	// may changed.
	watch(
		() => c.stateCounter,
		() => editorSyncScope(c)
	);

	return c;
}

export class ContentEditorController {
	/**
	 * Warning! Don't use this constructor. Use the {@link createContentEditor}
	 * function instead so that reactivity is kept.
	 */
	constructor(public readonly contentContext: ContentContext) {}

	// These will get set in the [createContentEditor] function.
	contextCapabilities!: ContextCapabilities;
	schema!: ContentEditorSchema;
	plugins!: Plugin<any, ContentEditorSchema>[];

	view: EditorView<ContentEditorSchema> | null = null;
	window = new ContentEditorWindow();
	scope = new ContentEditorScope();
	capabilities = new ContentEditorScopeCapabilities();

	/**
	 * Keep a copy of the json version of the doc, to only set the content if
	 * the external source changed.
	 */
	sourceContent: string | null = null;

	disabled = false;
	singleLineMode = false;

	stateCounter = 0;
	isFocused = false;

	/**
	 * Gets updated through the update-is-empty-plugin.
	 */
	isEmpty = true;

	/**
	 * Whenever a rich component needs to render in the editor, we store it here
	 * so we can build it out into the vue component tree.
	 */
	nodeViews: NodeViewRenderData[] = [];

	/**
	 * Indicates whether we want to currently show the mention suggestion panel.
	 * Values > 0 indicate true.
	 *
	 * This and [mentionUserCount] are both checked elsewhere to prevent certain
	 * mouse/keyboard events from triggering.
	 */
	canShowMentionSuggestions = 0;
	mentionUserCount = 0;

	controlsCollapsed = true;

	declare _editor?: {
		ownerController: () => ContentOwnerController;
		getWindowRect: () => DOMRect;
		emitSubmit: () => void;
		emitInput: (newSource: string) => void;
	};

	// Will get attached by the emoji panel when it's available within the
	// web/client.
	declare _emojiPanel?: {
		show: () => void;
	};

	/**
	 * The distance between the top of the editor container and the top of the cursor.
	 */
	get relativeCursorTop() {
		const windowTop = this.window.top;
		const cursorTop = this.scope.cursorStartTop ?? windowTop;
		return cursorTop - windowTop;
	}
}

class ContentEditorWindow {
	width: number;
	height: number;
	left: number;
	top: number;

	constructor(data?: Partial<ContentEditorWindow>) {
		this.width = data?.width ?? 0;
		this.height = data?.height ?? 0;
		this.left = data?.left ?? 0;
		this.top = data?.top ?? 0;
	}
}

/**
 * The state for our current cursor/selection. Stores things like which marks
 * are currently set, current block data, etc.
 */
class ContentEditorScope {
	isFocused: boolean;
	hasSelection: boolean;
	headingLevel: number | null;
	cursorStart: Coordinates | null;
	cursorEnd: Coordinates | null;
	bold: boolean;
	italic: boolean;
	strike: boolean;
	code: boolean;
	link: boolean;
	autolink: boolean;
	h1: boolean;
	h2: boolean;

	constructor(data?: Partial<ContentEditorScope>) {
		this.isFocused = data?.isFocused ?? false;
		this.hasSelection = data?.hasSelection ?? false;
		this.headingLevel = data?.headingLevel ?? null;
		this.cursorStart = data?.cursorStart ?? null;
		this.cursorEnd = data?.cursorEnd ?? null;
		this.bold = data?.bold ?? false;
		this.italic = data?.italic ?? false;
		this.strike = data?.strike ?? false;
		this.link = data?.link ?? false;
		this.autolink = data?.autolink ?? false;
		this.code = data?.code ?? false;
		this.h1 = data?.h1 ?? false;
		this.h2 = data?.h2 ?? false;
	}

	get cursorStartTop() {
		return this.cursorStart?.top ?? null;
	}

	get cursorStartBottom() {
		return this.cursorStart?.bottom ?? null;
	}

	get cursorEndTop() {
		return this.cursorEnd?.top ?? null;
	}

	get cursorEndBottom() {
		return this.cursorEnd?.bottom ?? null;
	}

	get cursorStartHeight() {
		const top = this.cursorStartTop;
		const bottom = this.cursorStartBottom;
		if (top === null || bottom === null) {
			return 0;
		}
		return bottom - top;
	}
}

/**
 * Stores the current capabilities within the editor for our current
 * cursor/selection.
 */
class ContentEditorScopeCapabilities {
	bold: boolean;
	italic: boolean;
	strike: boolean;
	code: boolean;
	link: boolean;
	h1: boolean;
	h2: boolean;
	emoji: boolean;
	gif: boolean;
	list: boolean;
	media: boolean;
	embed: boolean;
	codeBlock: boolean;
	blockquote: boolean;
	spoiler: boolean;
	hr: boolean;
	mention: string;

	constructor(data?: Partial<ContentEditorScopeCapabilities>) {
		this.bold = data?.bold ?? false;
		this.italic = data?.italic ?? false;
		this.strike = data?.strike ?? false;
		this.code = data?.code ?? false;
		this.link = data?.link ?? false;
		this.h1 = data?.h1 ?? false;
		this.h2 = data?.h2 ?? false;
		this.emoji = data?.emoji ?? false;
		this.gif = data?.gif ?? false;
		this.list = data?.list ?? false;
		this.media = data?.media ?? false;
		this.embed = data?.embed ?? false;
		this.codeBlock = data?.codeBlock ?? false;
		this.blockquote = data?.blockquote ?? false;
		this.spoiler = data?.spoiler ?? false;
		this.hr = data?.hr ?? false;
		this.mention = data?.mention ?? '';
	}

	get hasInlineControls() {
		return this.emoji;
	}

	get hasTextControls() {
		return this.bold || this.italic || this.strike || this.code || this.h1 || this.h2;
	}

	get hasBlockControls() {
		return (
			this.list ||
			this.media ||
			this.embed ||
			this.codeBlock ||
			this.blockquote ||
			this.spoiler ||
			this.hr
		);
	}

	get hasMentionControls() {
		return this.mention.length > 0;
	}
}

export async function editorCreateView(
	c: ContentEditorController,
	viewElement: HTMLElement,
	doc: ContentDocument,
	{ shouldFocus }: { shouldFocus?: boolean } = {}
) {
	if (doc.context !== c.contentContext) {
		throw new Error(
			`The passed in content context is invalid. ${doc.context} != ${c.contentContext}`
		);
	}

	// Do this here so we don't fire an update directly after populating.
	doc.ensureEndParagraph();

	const state = EditorState.create({
		doc: Node.fromJSON(c.schema, ContentFormatAdapter.adaptIn(doc)),
		plugins: c.plugins,
	});

	// Get rid of view for a previous doc that may have be set.
	c.view?.destroy();

	const nodeViews = buildEditorNodeViews(c);
	const eventHandlers = buildEditorEvents(c);

	// Since prosemirror handles the view, we want to make sure not to wrap it
	// in a proxy or instances may not match with our state vs theirs.
	c.view = markRaw(
		new EditorView<ContentEditorSchema>(viewElement, {
			state,
			nodeViews,
			handleDOMEvents: eventHandlers,
			editable: () => !c.disabled,
			attributes: {
				'data-prevent-shortkey': '',
			},
		})
	);

	editorUpdateIsEmpty(c, state);

	// Make sure we have a paragraph when loading in a new state
	const { view } = c;
	if (!c.disabled || view.state.doc.childCount === 0) {
		const tr = editorEnsureEndNode(view.state.tr, view.state.schema.nodes.paragraph);
		if (tr instanceof Transaction) {
			view.dispatch(tr);
		}
	}

	if (shouldFocus) {
		// Wait here so images and other content can render in and scale
		// properly. Otherwise the scroll at the end of the transaction
		// below would not cover the entire doc.
		await nextTick();

		// Set selection at the end of the document.
		const tr = view.state.tr;
		const selection = Selection.atEnd(view.state.doc);
		tr.setSelection(selection);
		tr.scrollIntoView();
		view.dispatch(tr);
		view.focus();
	}

	++c.stateCounter;
}

export function editorSyncWindow(c: ContentEditorController) {
	if (!c._editor) {
		return;
	}

	const { width, height, left, top } = c._editor.getWindowRect();
	c.window = new ContentEditorWindow({ width, height, left, top });

	if (GJ_IS_MOBILE_APP) {
		const msg = ContentEditorAppAdapterMessage.syncWindow(c);
		editorGetAppAdapter().send(msg);
	}
}

/**
 * Syncs the current state under the cursor/selection, as well as the
 * capabilities for what can be done with that selection.
 */
export function editorSyncScope(c: ContentEditorController) {
	if (!c.view) {
		return;
	}

	// In this case, we don't want anything to be available.
	if (c.disabled) {
		c.capabilities = new ContentEditorScopeCapabilities();
		return;
	}

	const {
		contextCapabilities,
		view: {
			state,
			state: { doc, schema, selection },
		},
		isFocused,
	} = c;
	const emojiNodeType = schema.nodes.gjEmoji;
	const cursorIndex = selection.$from.index();
	const node = editorGetSelectedNode(c);
	const parentNode = node && editorGetParentNode(c, node);
	const hasSelection = !selection.empty;

	/**
	 * Whether or not our current scope can be marked.
	 */
	const canBeMarked =
		(node?.type.name === 'text' || node?.type.name === 'paragraph') &&
		parentNode !== null &&
		parentNode.type.spec.marks !== '';

	/**
	 * Whether or not our current scope allows us to insert a block-level node.
	 */
	const canInsertBlock = !hasSelection && node?.type.name === 'paragraph';

	const marksForSelection = (canBeMarked && editorGetMarksForSelection(c)) || [];
	const hasMark = (markType: string) => marksForSelection.some(i => i.type.name === markType);

	const headingNode =
		canBeMarked && node && contextCapabilities.heading
			? editorGetParentNodeOfType(c, node, schema.nodes.heading)
			: null;
	const isInHeading = headingNode !== null;
	const headingLevel = headingNode !== null ? (headingNode.attrs.level as number) : null;

	const coordsStart = isFocused ? c.view.coordsAtPos(selection.from) : null;
	const coordsEnd = isFocused ? c.view.coordsAtPos(selection.to) : null;

	// Autolinks are somewhat special since it has an autolink attribute
	// assigned, so we have to check it manually.
	const hasAutolink =
		canBeMarked &&
		node?.isText &&
		marksForSelection.some(i => i.type.name === 'link' && !!i.attrs.autolink);

	// Update any floating controls and give mobile app info about our view.
	editorSyncWindow(c);

	c.scope = new ContentEditorScope({
		isFocused,
		hasSelection,
		headingLevel,
		cursorStart: coordsStart,
		cursorEnd: coordsEnd,
		bold: hasMark('strong'),
		italic: hasMark('em'),
		strike: hasMark('strike'),
		code: hasMark('code'),
		autolink: hasAutolink,
		// Link and autolink are exclusive.
		link: !hasAutolink && hasMark('link'),
		h1: headingLevel === 1,
		h2: headingLevel === 2,
	});

	const canHeading =
		canBeMarked &&
		contextCapabilities.heading &&
		// If we're not in a heading currently, we have to test to see if we can
		// wrap this current node in a heading or not.
		(isInHeading || wrapIn(schema.nodes.heading, { level: 1 })(state));

	let mention = '';
	if (
		canBeMarked &&
		contextCapabilities.mention &&
		node?.isText &&
		!hasSelection &&
		!editorIsNodeCode(node, parentNode)
	) {
		const slice = doc.slice(0, selection.from);
		const sliceText = _getFragmentText(slice.content);
		const matches = BasicMentionRegex.exec(sliceText);

		if (matches && matches.length >= 2) {
			mention = matches[1];
		}
	}

	c.capabilities = new ContentEditorScopeCapabilities({
		emoji:
			contextCapabilities.emoji &&
			selection.$from.parent.canReplaceWith(cursorIndex, cursorIndex, emojiNodeType),
		mention,
		...(canBeMarked
			? {
					bold: contextCapabilities.textBold,
					italic: contextCapabilities.textItalic,
					strike: contextCapabilities.textStrike,
					code: contextCapabilities.textCode,
					// Can't link/unlink if it's currently autolinked.
					link:
						!hasAutolink &&
						contextCapabilities.textLink &&
						contextCapabilities.customLink,
					h1: canHeading,
					h2: canHeading,
			  }
			: null),
		...(canInsertBlock
			? {
					gif: contextCapabilities.gif,
					list: contextCapabilities.list,
					media: contextCapabilities.media,
					embed: contextCapabilities.hasAnyEmbed,
					codeBlock: contextCapabilities.codeBlock,
					blockquote: contextCapabilities.blockquote,
					spoiler: contextCapabilities.spoiler,
					hr: contextCapabilities.hr,
			  }
			: null),
	});

	if (GJ_IS_MOBILE_APP) {
		const msg = ContentEditorAppAdapterMessage.syncScope(c);
		editorGetAppAdapter().send(msg);
	}
}

/**
 * Refocus the editor window if it's not currently focused.
 */
export function editorFocus(c: ContentEditorController) {
	if (!c.view) {
		return;
	}

	c.view.focus();
}

export function editorGetSelectedNode(c: ContentEditorController) {
	if (!c.view) {
		return null;
	}

	const { state } = c.view;
	let {
		selection: { from },
	} = state;

	let node = state.doc.nodeAt(from);
	// If the selection is between nodes, make sure we select the correct one.
	if (node === null && from > 0) {
		from--;
		node = state.doc.nodeAt(from);
	}
	return node ?? null;
}

// TODO: We might be able to use resolved pos with the depth attribute?
export function editorGetParentNode(c: ContentEditorController, child: Node<ContentEditorSchema>) {
	if (!c.view) {
		return null;
	}
	return _getParentNode(c.view.state.doc, child);
}

function _getParentNode(
	proposedParent: Node<ContentEditorSchema>,
	child: Node<ContentEditorSchema>
): null | Node<ContentEditorSchema> {
	for (let i = 0; i < proposedParent.childCount; i++) {
		const parentChild = proposedParent.child(i);
		if (parentChild === child) {
			return proposedParent;
		}

		const maybeParent = _getParentNode(parentChild, child);
		if (maybeParent !== null) {
			return maybeParent;
		}
	}

	return null;
}

function _findNode(
	doc: Node<ContentEditorSchema>,
	finder: (node: Node<ContentEditorSchema>) => boolean
) {
	// Loops through nodes trying to find the mediaUpload node with a matching uploadId
	for (let i = 0; i < doc.nodeSize; i++) {
		const node = doc.nodeAt(i);
		if (node !== null && node !== undefined && finder(node)) {
			return i;
		}
	}
	return -1;
}

/**
 * Tries getting a parent node of the given type.
 */
export function editorGetParentNodeOfType(
	c: ContentEditorController,
	child: Node<ContentEditorSchema>,
	nodeType: NodeType<ContentEditorSchema>
) {
	if (child.type.name === nodeType.name) {
		return child;
	}

	let parent = editorGetParentNode(c, child);
	while (parent !== null) {
		if (parent.type.name === nodeType.name) {
			return parent;
		}

		// Walk up
		child = parent;
		parent = editorGetParentNode(c, child);
	}
	return null;
}

/**
 * Returns a list of all marks applied to any node within the selection
 */
export function editorGetMarksForSelection(c: ContentEditorController) {
	const markTypes: Mark<ContentEditorSchema>[] = [];
	if (!c.view) {
		return markTypes;
	}

	const {
		state: { doc, selection },
	} = c.view;

	doc.nodesBetween(
		selection.from,
		selection.to,
		(node: Node<ContentEditorSchema>, _0: number, _1: Node, _2: number) => {
			for (const mark of node.marks) {
				if (!markTypes.some(m => m.type.name === mark.type.name)) {
					markTypes.push(mark);
				}
			}
		}
	);

	return markTypes;
}

/**
 * Resolves the position of the node in the document.
 */
export function editorResolveNodePosition(
	c: ContentEditorController,
	node: Node<ContentEditorSchema>,
	newState?: EditorState<ContentEditorSchema>
) {
	if (!c.view && !newState) {
		throw new Error('No view yet or new state provided.');
	}

	const doc = newState?.doc ?? c.view!.state.doc;

	// TODO: Is there a faster way to do this using prosemirror?
	let found = -1;
	doc.descendants((child, pos) => {
		if (found > -1) {
			return false;
		}
		if (child === node) {
			found = pos;
			return false;
		}
	});

	if (found === -1) {
		throw new Error('Node not found in document');
	}

	return found;
}

/**
 * Ensures that the last node in the editor doc is a specific node.
 */
export function editorEnsureEndNode(
	tr: Transaction<ContentEditorSchema>,
	nodeType: NodeType<ContentEditorSchema>
) {
	if (tr.doc.lastChild && tr.doc.lastChild.type.name !== nodeType.name) {
		const newNode = nodeType.create();
		return tr.insert(tr.doc.nodeSize - 2, newNode);
	}
	return null;
}

/**
 * Starts the upload for an image File passed in. This is used on web.
 */
export function editorUploadImageFile(c: ContentEditorController, file: File | null) {
	if (file === null || !isImage(file)) {
		return false;
	}

	const uploadTask = createMediaUploadTask(c, uuidv4(), { file });
	editorMediaUploadInsert(c, uploadTask);
	return true;
}

export function editorGetLink(c: ContentEditorController): string | null {
	return editorGetSelectedNode(c)?.marks.find(i => !!i.attrs.href)?.attrs.href ?? null;
}

export function editorToggleMark(
	c: ContentEditorController,
	mark: MarkType<ContentEditorSchema>,
	attrs?: { [key: string]: any }
) {
	if (!c.view) {
		return;
	}

	toggleMark(mark, attrs)(c.view.state, tr => c.view?.dispatch(tr));
}

export function editorLink(
	c: ContentEditorController,
	href: string,
	options?: { from?: number; to?: number }
) {
	// Allow them to link even if one is currently set so that it can overwrite.
	if (!c.view) {
		return;
	}

	const {
		view,
		view: {
			state: { tr, doc, schema },
		},
	} = c;

	// If a range was passed in, set the link on this instead of what's currently selected.
	if (options?.from && options?.to) {
		const { from, to } = options;
		const newSelection = new TextSelection(doc.resolve(from), doc.resolve(to));
		tr.setSelection(newSelection);
		view.dispatch(tr);
		view.focus();
	}

	editorToggleMark(c, schema.marks.link, { href });
}

export function editorUnlink(c: ContentEditorController) {
	// Unlinking is just toggling the "link" mark when it's on.
	if (!c.view || !c.scope.link) {
		return;
	}

	editorToggleMark(c, c.view.state.schema.marks.link);
}

export function editorToggleHeading(c: ContentEditorController, level: 1 | 2) {
	if (!c.view || !c.capabilities.h1 || !c.capabilities.h2) {
		return;
	}

	const {
		view,
		view: {
			state,
			state: { schema, tr },
		},
	} = c;

	let curLevel = 0;
	if (c.scope.h1) {
		curLevel = 1;
	} else if (c.scope.h2) {
		curLevel = 2;
	}

	// If our cursor is currently within a heading node.
	if (curLevel > 0) {
		const node = editorGetSelectedNode(c);
		if (node === null) {
			return;
		}

		// If we are toggling the same heading level, we actually want to
		// "un-heading" this node.
		if (level === curLevel) {
			let lifted;
			do {
				lifted = lift(state, view.dispatch);
			} while (lifted && editorGetParentNodeOfType(c, node, schema.nodes.heading) !== null);
		}
		// Otherwise we need to change the current heading node to the new level.
		else {
			const headingParentNode = editorGetParentNodeOfType(c, node, schema.nodes.heading);
			if (headingParentNode === null) {
				return;
			}

			const nodePos = editorResolveNodePosition(c, headingParentNode);
			tr.setNodeMarkup(nodePos, undefined, { level });
			view.dispatch(tr);
		}
	}
	// If we're not in a heading scope, wrap in heading.
	else {
		wrapIn(schema.nodes.heading, { level })(state, view.dispatch);
	}
}

export function editorInsertBulletList(c: ContentEditorController) {
	if (!c.capabilities.list) {
		return;
	}

	_insertNewBlockNode(c, schema => {
		const contentNode = schema.nodes.paragraph.create();
		const listItemNode = schema.nodes.listItem.create({}, contentNode);
		return schema.nodes.bulletList.create({}, listItemNode);
	});
}

export function editorInsertNumberedList(c: ContentEditorController) {
	if (!c.capabilities.list) {
		return;
	}

	_insertNewBlockNode(c, schema => {
		const contentNode = schema.nodes.paragraph.create();
		const listItemNode = schema.nodes.listItem.create({}, contentNode);
		return schema.nodes.orderedList.create({}, listItemNode);
	});
}

export function editorInsertSpoiler(c: ContentEditorController) {
	if (!c.capabilities.spoiler) {
		return;
	}

	_insertNewBlockNode(c, schema => {
		const contentNode = schema.nodes.paragraph.create();
		return schema.nodes.spoiler.create({}, contentNode);
	});
}

export function editorInsertBlockquote(c: ContentEditorController) {
	if (!c.capabilities.blockquote) {
		return;
	}

	_insertNewBlockNode(c, schema => {
		const contentNode = schema.nodes.paragraph.create();
		return schema.nodes.blockquote.create({}, contentNode);
	});
}

export function editorInsertHr(c: ContentEditorController) {
	if (!c.capabilities.hr) {
		return;
	}

	_insertNewBlockNode(c, schema => schema.nodes.hr.create());
}

export function editorInsertCodeBlock(c: ContentEditorController) {
	if (!c.capabilities.codeBlock) {
		return;
	}

	_insertNewBlockNode(c, schema => schema.nodes.codeBlock.create());
}

export function editorShowEmojiPanel(c: ContentEditorController) {
	c._emojiPanel?.show();
}

export function editorInsertEmoji(
	c: ContentEditorController,
	emoji: EmojiModel | (typeof GJ_EMOJIS)[number]
) {
	if (!c.capabilities.emoji) {
		return;
	}

	const options: any = {};
	if (typeof emoji === 'string') {
		options.type = emoji;
	} else {
		options.id = emoji.id;
	}

	_insertNewInlineNode(c, schema => schema.nodes.gjEmoji.create(options));
}

export function editorInsertGif(c: ContentEditorController, gif: SearchResult) {
	if (!c.capabilities.gif) {
		return;
	}

	_insertNewBlockNode(c, schema =>
		schema.nodes.gif.create({
			id: gif.id,
			width: gif.width,
			height: gif.height,
			service: 'tenor',
			media: { webm: gif.webm, mp4: gif.mp4, preview: gif.preview },
			url: gif.url,
		})
	);
}

export function editorInsertEmbed(c: ContentEditorController) {
	if (!c.capabilities.embed) {
		return;
	}

	_insertNewBlockNode(c, schema => schema.nodes.embed.create());
}

export function editorInsertMention(c: ContentEditorController, username: string) {
	if (!c.view || !c.capabilities.mention) {
		return;
	}

	const {
		view,
		view: {
			state: { selection, tr },
		},
	} = c;

	const start = selection.from - c.capabilities.mention.length - 1;
	const end = selection.from;

	// Add space to the end.
	tr.insertText(`@${username} `, start, end);
	view.dispatch(tr);
}

/**
 * Used by both web and app to insert a node into the document for a media
 * upload. The MediaUploadTask has to be created first.
 */
export function editorMediaUploadInsert(c: ContentEditorController, uploadTask: MediaUploadTask) {
	if (!c.capabilities.media) {
		return;
	}

	// The media upload node will use the uploadId to find the task in this
	// object.
	ContentEditorService.UploadTaskCache[uploadTask.uploadId] = markRaw(uploadTask);

	// TODO: This might need to insert an inline node.
	_insertNewBlockNode(c, schema =>
		schema.nodes.mediaUpload.create({
			uploadId: uploadTask.uploadId,
		})
	);
}

/**
 * Finalized a media upload and replaces the media upload placeholder node with
 * the actual media item that was uploaded.
 */
export function editorMediaUploadFinalize(uploadTask: MediaUploadTask, mediaItem: MediaItemModel) {
	const c = uploadTask.editorController;
	if (!c.view) {
		return;
	}

	const {
		view,
		view: {
			state: { tr, schema, doc },
		},
	} = c;

	delete ContentEditorService.UploadTaskCache[uploadTask.uploadId];

	const nodePos = _findNode(
		doc,
		i => i.type.name === 'mediaUpload' && i.attrs.uploadId === uploadTask.uploadId
	);
	if (nodePos !== -1) {
		tr.setNodeMarkup(nodePos, schema.nodes.mediaItem, {
			id: mediaItem.id,
			width: mediaItem.width,
			height: mediaItem.height,
			align: 'center',
			caption: '',
		});
		view.dispatch(tr);
	}
}

/**
 * Will remove a media upload node. Used when the upload task has failed for
 * some reason.
 */
export function editorMediaUploadCancel(uploadTask: MediaUploadTask) {
	const c = uploadTask.editorController;
	if (!c.view) {
		return;
	}

	const {
		view,
		view: {
			state: { tr, doc },
		},
	} = c;

	delete ContentEditorService.UploadTaskCache[uploadTask.uploadId];

	const nodePos = _findNode(
		doc,
		i => i.type.name === 'mediaUpload' && i.attrs.uploadId === uploadTask.uploadId
	);
	if (nodePos !== -1) {
		tr.delete(nodePos, nodePos + 1);
		view.dispatch(tr);
	}
}

/**
 * Returns whether the node passed in is within a code mark or code block.
 */
export function editorIsNodeCode(
	node: Node<ContentEditorSchema>,
	parentNode: null | Node<ContentEditorSchema>
) {
	if (node.type.name === 'text') {
		return (
			node.marks.some(i => i.type.name === 'code') || parentNode?.type.name === 'codeBlock'
		);
	}

	return false;
}

export function editorGetSelectedText(c: ContentEditorController) {
	const { selection } = c.view?.state ?? {};
	if (!c.view || selection?.empty !== false) {
		return '';
	}
	return _getFragmentText(selection.content().content);
}

/**
 * Replaces the selection with a new inline node.
 */
function _insertNewInlineNode(
	c: ContentEditorController,
	nodeBuilder: (schema: ContentEditorSchema) => Node<ContentEditorSchema>
) {
	if (!c.view) {
		return;
	}

	const {
		view,
		view: {
			state: { schema, tr },
		},
	} = c;

	tr.replaceSelectionWith(nodeBuilder(schema));

	view.focus();
	view.dispatch(tr);
}

/**
 * Replaces an empty paragraph with a new block node.
 */
function _insertNewBlockNode(
	c: ContentEditorController,
	nodeBuilder: (schema: ContentEditorSchema) => Node<ContentEditorSchema>
) {
	if (!c.view) {
		return;
	}

	const {
		view,
		view: {
			state: { schema, selection, tr },
		},
	} = c;

	tr.replaceWith(selection.from - 1, selection.to + 1, nodeBuilder(schema));

	const resolvedCursorPos = tr.doc.resolve(selection.from);
	const resolvedSelection = Selection.near(resolvedCursorPos);
	tr.setSelection(resolvedSelection);
	editorEnsureEndNode(tr, schema.nodes.paragraph);

	view.focus();
	view.dispatch(tr);
}

/**
 * Returns the string of text content within the fragment passed in.
 */
function _getFragmentText(frag: Fragment<ContentEditorSchema> | Node<ContentEditorSchema>) {
	let text = '';
	frag.forEach((child, _offset, _index) => {
		// We put the new line above the text rather than below so that mention
		// regex can still work properly.
		if (child.isBlock || child.type.name === 'hardBreak') {
			text += '\n';
		}

		if (child.isText) {
			text += child.text;
		} else if (!child.isLeaf) {
			text += _getFragmentText(child);
		}
	});

	return text;
}

export function editorUpdateContent(
	c: ContentEditorController,
	state: EditorState<ContentEditorSchema>
) {
	const source = ContentFormatAdapter.adaptOut(
		state.doc.toJSON() as ProsemirrorEditorFormat,
		c.contentContext
	).toJson();
	c.sourceContent = source;
	c._editor?.emitInput(source);
}

export function editorUpdateIsEmpty(c: ContentEditorController, state: EditorState) {
	// The "empty" prosemirror document takes up a length of 4.
	c.isEmpty = state.doc.nodeSize <= 4;
}

export function editorSubmit(c: ContentEditorController) {
	++c.stateCounter;
	c._editor?.emitSubmit();
}
