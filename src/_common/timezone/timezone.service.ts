import { Api } from '../api/api.service';

export interface TimezoneData {
	i: string;
	r: string;
	o: number;
}

export class Timezone {
	private static timezonesFetch: Promise<TimezoneData[]>;
	private static groupedTimezones: { [region: string]: TimezoneData[] };

	private static async fetchTimezones() {
		// Raw request (ignore most payload stuff).
		const options = {
			withCredentials: false,
			detach: true,
			processPayload: false,
		};

		const response = await Api.sendRequest('/jams/manage/jams/get-timezones', null, options);
		return response.data;
	}

	static getTimezones() {
		if (!this.timezonesFetch) {
			this.timezonesFetch = this.fetchTimezones();
		}

		return this.timezonesFetch;
	}

	static async getGroupedTimezones() {
		if (!this.groupedTimezones) {
			const timezones = await this.getTimezones();
			this.groupedTimezones = {};
			for (let timezone of timezones) {
				const arr = this.groupedTimezones[timezone.r];
				if (arr) {
					arr.push(timezone);
					continue;
				}
				this.groupedTimezones[timezone.r] = [timezone];
			}
		}

		return this.groupedTimezones;
	}
}
