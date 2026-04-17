import { ContentContext } from '~common/content/content-context';

export interface ContentContainerModel {
	getContent(context: ContentContext): string;
}
