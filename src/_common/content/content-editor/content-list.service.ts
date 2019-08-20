import { Fragment, NodeRange, NodeType, Slice } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { liftTarget, ReplaceAroundStep } from 'prosemirror-transform';
import { ContentEditorSchema } from './schemas/content-editor-schema';

type DispatchFunc = (tr: Transaction<ContentEditorSchema>) => void;

export class ContentListService {
	/**
	 * Moves a list item one level up in the list indentation, but does NOT have the ability to lift it out of the list completely.
	 *
	 * Copied (and modified for TS) from https://github.com/ProseMirror/prosemirror-schema-list/blob/master/src/schema-list.js
	 *
	 * Also includes the liftToOuterList function defined below.
	 */
	public static liftListItem(itemType: NodeType<ContentEditorSchema>) {
		const that = this;

		return function(state: EditorState<ContentEditorSchema>, dispatch: DispatchFunc) {
			let { $from, $to } = state.selection;
			let range = $from.blockRange(
				$to,
				node => node.childCount > 0 && node.firstChild!.type === itemType
			);
			if (!range) {
				return false;
			}
			if (!dispatch) {
				return true;
			}
			if ($from.node(range.depth - 1).type == itemType) {
				// Inside a parent list
				return that.liftToOuterList(state, dispatch, itemType, range);
			} else {
				// Outer list node
				return false;
			}
		};
	}

	private static liftToOuterList(
		state: EditorState<ContentEditorSchema>,
		dispatch: DispatchFunc,
		itemType: NodeType<ContentEditorSchema>,
		range: NodeRange<ContentEditorSchema>
	) {
		const tr = state.tr,
			end = range.end,
			endOfList = range.$to.end(range.depth);
		if (end < endOfList) {
			// There are siblings after the lifted items, which must become
			// children of the last item
			tr.step(
				new ReplaceAroundStep(
					end - 1,
					endOfList,
					end,
					endOfList,
					new Slice(Fragment.from(itemType.create(undefined, range.parent.copy())), 1, 0),
					1,
					true
				)
			);
			range = new NodeRange<ContentEditorSchema>(
				tr.doc.resolve(range.$from.pos),
				tr.doc.resolve(endOfList),
				range.depth
			);
		}
		dispatch(tr.lift(range, liftTarget(range)!).scrollIntoView());
		return true;
	}
}
