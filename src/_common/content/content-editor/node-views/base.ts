import { Node } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import Vue from 'vue';
import { ContentEditorSchema } from '../schemas/content-editor-schema';

export type GetPosFunction = () => number;

export abstract class BaseNodeView implements NodeView {
	protected node: Node<ContentEditorSchema>;
	protected view: EditorView<ContentEditorSchema>;
	protected getPos: GetPosFunction;

	public dom: HTMLElement;

	constructor(
		node: Node<ContentEditorSchema>,
		view: EditorView<ContentEditorSchema>,
		getPos: GetPosFunction
	) {
		this.node = node;
		this.view = view;
		this.getPos = getPos;

		this.dom = this.createDOM();

		// Mount component in the next tick, after it got mounted to the DOM, because Vue needs it mounted.
		Vue.nextTick().then(() => {
			this.mounted();
		});
	}

	protected createDOM(): HTMLElement {
		return document.createElement('div');
	}

	protected createVueMountDOM(): HTMLElement {
		const container = document.createElement('div');
		this.dom.appendChild(container);
		return container;
	}

	mounted(): void {}

	destroy() {
		// Clean up dom element when this view gets removed
		this.dom.remove();
	}

	protected mountVue(vm: Vue) {
		// Mount the Vue instance onto an inner div to not disturb the div managed by the prosemirror editor
		const container = this.createVueMountDOM();
		if (vm.$props !== undefined) {
			vm.$props.isEditing = true;
		}
		vm.$mount(container);
		vm.$on('removed', () => {
			this.removeMe();
		});
		vm.$on('updateAttrs', (attrs: object) => {
			this.updateAttrs(attrs);
		});
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
