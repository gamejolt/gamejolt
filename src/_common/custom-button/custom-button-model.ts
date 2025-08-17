import { Api } from '../api/api.service';

export class CustomButtonModel {
	declare id: string;
	declare text: string;
	declare image_url: string | undefined;

	constructor(data: any = {}) {
		this.id = data.id || '';
		this.text = data.text || '';
		this.image_url = data.image_url || undefined;
	}

	async sendWhereToGo(): Promise<{ target_url: string; new_tab: boolean }> {
		let url = `/web/custom-buttons/where-to-go/${this.id}?no-redirect=1`;

		// Cache busting.
		url += '&cb=' + Date.now();

		const response = await Api.sendRequest(url, null, { detach: true });
		return response;
	}
}
