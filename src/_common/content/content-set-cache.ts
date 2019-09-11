import { ContentContainerModel } from './content-container-model';
import { ContentContext } from './content-context';
import { ContentDocument } from './content-document';

/**
 * Caches ContentDocument computed results.
 */
class ContentSetCache {
	private readonly _container: ContentContainerModel;
	private readonly _context: ContentContext;

	private _hasContent = false;
	private _length = -1;
	private _checkValue: string | undefined = undefined;

	constructor(container: ContentContainerModel, context: ContentContext) {
		this._container = container;
		this._context = context;
	}

	public get hasContent() {
		const content = this._container.getContent(this._context);
		if (this._checkValue !== content) {
			const doc = ContentDocument.fromJson(content);
			this._hasContent = doc.hasContent;
		}

		return this._hasContent;
	}

	public get length() {
		const content = this._container.getContent(this._context);
		if (this._checkValue !== content) {
			const doc = ContentDocument.fromJson(content);
			this._length = doc.getLength();
		}

		return this._length;
	}
}

export class ContentSetCacheService {
	private static _caches = new WeakMap<
		ContentContainerModel,
		Map<ContentContext, ContentSetCache>
	>();

	public static getCache(
		container: ContentContainerModel,
		context: ContentContext
	): ContentSetCache {
		let containerMap = this._caches.get(container);
		if (containerMap === undefined) {
			containerMap = new Map<ContentContext, ContentSetCache>();
			this._caches.set(container, containerMap);
		}

		let cache = containerMap.get(context);
		if (cache === undefined) {
			cache = new ContentSetCache(container, context);
			containerMap.set(context, cache);
		}

		return cache;
	}
}
