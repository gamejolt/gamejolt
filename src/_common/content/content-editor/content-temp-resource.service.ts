import { Api } from '../../api/api.service';
import { ContentContext } from '../content-context';

export class ContentTempResource {
	public static async getTempModelId(context: ContentContext, postData: any) {
		const payload = await Api.sendRequest(
			`/web/content/temp-resource-id/${context}`,
			postData,
			{
				noErrorRedirect: true,
			}
		);
		if (payload && payload.id) {
			return parseInt(payload.id, 10);
		}
		throw new Error('Failed to fetch temp model id');
	}
}
