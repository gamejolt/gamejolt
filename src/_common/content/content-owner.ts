import { ContentContext, ContextCapabilities } from './content-context';
import { ContentDocument } from './content-document';
import { ContentHydrator } from './content-hydrator';

export interface ContentOwner {
	getHydrator(): ContentHydrator;
	getCapabilities(): ContextCapabilities;
	getContext(): ContentContext;

	getContent(): ContentDocument | null;
	setContent(content: ContentDocument): void;

	getModelId(): Promise<number>;
}
