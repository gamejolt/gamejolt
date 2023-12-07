export class RegistryItemConfig {
	constructor(public maxItems = 0) {}
}

class RegistryService {
	config: { [k: string]: RegistryItemConfig } = {};
	items: { [k: string]: any[] } = {};

	setConfig(type: string, config: RegistryItemConfig) {
		this.config[type] = config;
	}

	store(type: string, newItems: any[] | any) {
		if (typeof this.config[type] === 'undefined') {
			this.config[type] = new RegistryItemConfig();
		}

		if (!this.config[type].maxItems) {
			return;
		}

		if (typeof this.items[type] === 'undefined') {
			this.items[type] = [];
		}

		if (!Array.isArray(newItems)) {
			newItems = [newItems];
		}

		// We remove new items from the current array so that they put at the
		// end and don't get cleaned out.
		const toRemove = [];
		for (const item of newItems) {
			for (let i = 0; i < this.items[type].length; ++i) {
				if (this.items[type][i].id === item.id) {
					toRemove.push(i);
					break;
				}
			}
		}

		if (toRemove.length) {
			for (const index of toRemove) {
				this.items[type].splice(index, 1);
			}
		}

		this.items[type] = this.items[type].concat(newItems);
		this.items[type] = this.items[type].slice(-this.config[type].maxItems);
	}

	find<T>(type: string, fn: (i: T) => boolean): T | null {
		if (typeof this.items[type] === 'undefined') {
			this.items[type] = [];
		}

		return this.items[type].find(fn) || null;
	}
}

export const Registry = /** @__PURE__ */ new RegistryService();
