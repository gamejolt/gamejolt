export class DogtagData {
	constructor(data: any = {}) {
		Object.assign(this, data);
	}

	declare ids: number[];
	declare text: string;

	static populate(rows: any[]): any[] {
		const models: any[] = [];
		if (rows && Array.isArray(rows) && rows.length) {
			for (const row of rows) {
				models.push(new DogtagData(row));
			}
		}
		return models;
	}
}
