import { Api } from '../../api/api.service';
import { ContentContext } from '../content-context';

class ContentTempResourceService {
	public async getTempModelId(context: ContentContext, postData: any) {
		const payload = await Api.sendRequest(
			`/web/content/temp-resource-id/${context}`,
			// Make sure it's a POST request.
			postData || {},
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

export const ContentTempResource = /** @__PURE__ */ new ContentTempResourceService();
