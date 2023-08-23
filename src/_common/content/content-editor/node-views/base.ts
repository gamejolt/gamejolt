import { Node } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import type { Component, PropType } from 'vue';
import { markRaw, nextTick, reactive } from 'vue';
import { arrayRemove } from '../../../../utils/array';
import { ContentEditorController } from '../content-editor-controller';
import { ContentEditorSchema } from '../schemas/content-editor-schema';

/**
 * Can be mixed into content components that want to act as an editable node
 * view to specify their props.
 */
export function defineEditableNodeViewProps() {
	return {
		onRemoved: {
			type: Function as PropType<() => void>,
			default: undefined,
		},
		onUpdateAttrs: {
			type: Function as PropType<(attrs: Record<string, unknown>) => void>,
			default: undefined,
		},
	};
}

export type GetPosFunction = () => number;

export interface NodeViewRenderData {
	id: number;
	component: Component;
	props: Record<string, unknown>;
	targetElement: HTMLElement;
}

let idIncrementer = 0;

export abstract class BaseNodeView implements NodeView {
	constructor(
		protected readonly c: ContentEditorController,
		protected node: Node<ContentEditorSchema>,
		protected readonly view: EditorView<ContentEditorSchema>,
		protected readonly getPos: GetPosFunction
	) {
		this.node = node;
		this.view = view;
		this.getPos = getPos;

		this.dom = this.createDOM();

		// Mount component in the next tick, after it got mounted to the DOM,
		// because Vue needs it mounted.
		nextTick().then(() => {
			this.mounted();
		});
	}

	id = ++idIncrementer;
	dom: HTMLElement;
	renderData?: NodeViewRenderData;

	protected createDOM(): HTMLElement {
		return document.createElement('span');
	}

	mounted(): void {}

	destroy() {
		arrayRemove(this.c.nodeViews, i => i === this.renderData);
		this.dom.remove();
	}

	protected mountVue(
		component: Component,
		props: Record<string, unknown> = {},
		{ inline }: { inline?: boolean } = {}
	) {
		// Mount the Vue instance onto an inner element to not disturb the html
		// element managed by the prosemirror editor
		const targetElement = document.createElement(inline ? 'span' : 'div');
		this.dom.appendChild(targetElement);

		this.renderData = reactive({
			id: this.id,
			targetElement: markRaw(targetElement),
			component: markRaw(component),
			props: {
				...props,
				isEditing: true,
				onRemoved: () => {
					this.removeMe();
				},
				onUpdateAttrs: (attrs: Record<string, unknown>) => {
					this.updateAttrs(attrs);
				},
			},
		});

		this.c.nodeViews.push(this.renderData);
	}

	removeMe() {
		const tr = this.view.state.tr;
		const pos = this.getPos();
		tr.replace(pos, pos + 1, undefined);
		this.view.dispatch(tr);
	}

	updateAttrs(attrs: any) {
		// Merge the old and new attribute lists
		const newAttrs = {} as any;
		for (const currentKey of Object.keys(this.node.attrs)) {
			newAttrs[currentKey] = this.node.attrs[currentKey];
		}
		for (const newKey of Object.keys(attrs)) {
			newAttrs[newKey] = attrs[newKey];
		}

		// Only apply changes to the node attributes
		const tr = this.view.state.tr;
		tr.setNodeMarkup(this.getPos(), undefined, newAttrs);
		this.view.dispatch(tr);
	}
}
