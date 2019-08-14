import { ContentContext } from './content-context';

export interface ContentContainerModel {
	getContent(context: ContentContext): string;
}
