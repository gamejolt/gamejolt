import { LocalDbModel } from './model.service';
import * as fs from 'fs-extra';
import * as writeFileAtomic from 'write-file-atomic';
import { Properties } from '../../../../lib/gj-lib-client/utils/utils';

type Data<T> = {
	version: number;
	objects: DataObjects<T>;
	groups: DataGroups<T>;
};

type DataObjects<T> = { [id: number]: Partial<T> };

type GroupableFields<T> = Pick<T, Properties<T, Number>>;
type DataGroups<T> = {
	[field in keyof GroupableFields<T>]?: {
		[id: number]: number[];
	}
};

type UpgradeFunc<T> = (oldVersion: any, data: any) => Promise<DataObjects<T>>;

export class Collection<T extends LocalDbModel<T>> {
	private version: number;

	private file: string;
	private ctor: { new (): T };
	private upgradeFunc?: UpgradeFunc<T>;

	private data: Data<T>;
	private groupFields: (keyof DataGroups<T>)[];

	constructor(version: number, file: string, ctor: { new (): T }, upgradeFunc?: UpgradeFunc<T>) {
		this.version = version;

		this.file = file;
		this.ctor = ctor;
		this.upgradeFunc = upgradeFunc;

		this.data = { version: this.version, objects: {}, groups: {} };
		this.groupFields = [];
	}

	async load() {
		if (!(await fs.pathExists(this.file))) {
			console.log(`${this.file} doesnt exist, initializing new data`);
			this.data = { version: this.version, objects: {}, groups: {} };
			return;
		}

		console.log(`reading ${this.file}`);
		let data = await fs.readJson(this.file);

		let version = 0;
		if (typeof data !== 'object' || !('version' in data)) {
			version = 0;
		} else {
			version = data.version;
		}

		if (version !== this.version) {
			console.log(`upgrading ${this.file} from ${version} to ${this.version}`);
			await this.upgrade(version, data);
			return;
		}

		console.log(`${this.file} loaded successfully`);

		// We don't do any integrity checks on the json we read. We trust that if the versions match, everything is fine.
		this.data = data;

		// We might need to reindex if we've defined different groups than what we had saved.
		// Simply lazy comparison by stringifying the arrays after sorting.
		const existingGroups = Object.keys(this.data.groups);
		if (JSON.stringify(this.groupFields.sort()) !== JSON.stringify(existingGroups.sort())) {
			console.log(`${this.file} is reindexing`);
			this.reindexGroups();
			await this.save();
		}

		// Is this a refactoring artifact? we shouldn't have to reindex the collection immediately after loading it.
		// this.reindexGroups();
		// await this.save();

		console.log(`${this.file} is ready`);
	}

	private async upgrade(oldVersion: any, data: any) {
		if (!this.upgradeFunc) {
			throw new Error('Upgrade needed for DB, but no upgrade func given');
		}

		this.data = {
			version: this.version,
			objects: await this.upgradeFunc(oldVersion, data),
			groups: {},
		};
		this.reindexGroups();

		await this.save();
	}

	defineGroup(field: keyof DataGroups<T>) {
		if (this.groupFields.indexOf(field) === -1) {
			this.groupFields.push(field);
			this.reindexGroup(field);
		}
	}

	reindexGroups() {
		this.data.groups = {};

		for (let field of this.groupFields) {
			this.reindexGroup(field);
		}
	}

	private reindexGroup(field: keyof DataGroups<T>) {
		const newGroup: { [id: number]: number[] } = {};
		this.data.groups[field] = newGroup;
		for (let id in this.data.objects) {
			const dataObj = this.data.objects[id];

			// Need the any cast here because TS cannot assert that dataObj[field] will always be a number.
			const groupVal: number = dataObj[field] as any;
			if (!(groupVal in newGroup)) {
				newGroup[groupVal] = [];
			}

			newGroup[groupVal].push(dataObj.id!);
		}
	}

	save() {
		return new Promise<void>((resolve, reject) => {
			writeFileAtomic(this.file, JSON.stringify(this.data), {}, err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	}

	async clear() {
		if (fs.pathExistsSync(this.file)) {
			await fs.unlink(this.file);
		}

		const emptyGroups: DataGroups<T> = {};
		for (let field in this.data.groups) {
			emptyGroups[field] = {};
		}
		this.data = { version: this.data.version, objects: {}, groups: emptyGroups };
	}

	all(): T[] {
		const result: T[] = [];

		for (let id in this.data.objects) {
			const model = this.get(parseInt(id, 10));
			result.push(model!);
		}
		return result;
	}

	count(): number {
		return Object.keys(this.data.objects).length;
	}

	countInGroup(group: keyof DataGroups<T>, value: number): number {
		if (!(group in this.data.groups)) {
			return 0;
		}

		const groupData = this.data.groups[group]!;
		if (!(value in groupData)) {
			return 0;
		}

		return groupData[value]!.length;
	}

	get(id: number): T | null {
		const dataObj = this.data.objects[id];
		if (!dataObj) {
			return null;
		}

		const instance = new this.ctor();
		for (let field in dataObj) {
			if (instance.hasOwnProperty(field)) {
				try {
					(instance as any)[field] = dataObj[field];
				} catch (_) {}
			}
		}

		instance.hydrate();
		return instance;
	}

	put(model: T) {
		this.data.objects[model.id] = JSON.parse(JSON.stringify(model));

		for (let field of this.groupFields) {
			if (!(field in this.data.groups)) {
				this.data.groups[field] = {};
			}

			const group = this.data.groups[field]!;

			// Need the any cast here becaucse TS cannot assert that model[field] will always be a number.
			const groupVal: number = model[field] as any;
			if (!(groupVal in group)) {
				group[groupVal] = [];
			}

			if (group[groupVal].indexOf(model.id) === -1) {
				group[groupVal].push(model.id);
			}
		}
	}

	delete(id: number) {
		if (!(id in this.data.objects)) {
			return;
		}

		const model = this.data.objects[id];
		delete this.data.objects[id];

		for (let field of this.groupFields) {
			if (!(field in this.data.groups)) {
				continue;
			}

			const group = this.data.groups[field]!;

			// Need the any cast here because TS cannot assert that model[field] will always be a number.
			const groupVal: number = model[field] as any;
			if (!(groupVal in group)) {
				continue;
			}

			group[groupVal] = group[groupVal].filter(groupId => groupId !== id);
		}
	}
}
