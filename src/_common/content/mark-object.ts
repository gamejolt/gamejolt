export type MarkObjectType = 'strong' | 'em' | 'code' | 'link' | 'strike' | 'mention' | 'tag';

export class MarkObject {
	public type!: MarkObjectType;
	public attrs!: { [key: string]: any };

	constructor(type: MarkObjectType) {
		this.type = type;
		this.attrs = {};
	}

	public static fromJsonObj(jsonObj: any): MarkObject {
		const obj = new MarkObject(jsonObj.type);

		if (jsonObj.attrs === undefined) {
			obj.attrs = {};
		} else {
			obj.attrs = jsonObj.attrs;
		}

		return obj;
	}

	public toJsonObj(): any {
		const jsonObj = {} as any;

		jsonObj.type = this.type;

		if (Object.keys(this.attrs).length > 0) {
			jsonObj.attrs = this.attrs;
		}

		return jsonObj;
	}
}
