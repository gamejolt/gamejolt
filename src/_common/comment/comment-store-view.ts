import { CommentModel } from './comment-model';
import { CommentStoreModel } from './comment-store';

export interface CommentStoreView {
	getParents(storeModel: CommentStoreModel): CommentModel[];
}

export class CommentStoreSliceView implements CommentStoreView {
	private _commentIds: number[] = [];

	public registerIds(ids: number[]) {
		this._commentIds.push(...ids);
	}

	public getParents(storeModel: CommentStoreModel) {
		return storeModel.parentComments.filter(c => this._commentIds.indexOf(c.id) !== -1);
	}
}

export class CommentStoreThreadView implements CommentStoreView {
	parentCommentId: number;

	public constructor(parentCommentId: number) {
		this.parentCommentId = parentCommentId;
	}

	public getParents(storeModel: CommentStoreModel) {
		const parent = storeModel.parentComments.find(c => c.id === this.parentCommentId);
		return parent ? [parent] : [];
	}

	public getChildren(storeModel: CommentStoreModel) {
		const children = storeModel.childComments;
		return children[this.parentCommentId];
	}
}
