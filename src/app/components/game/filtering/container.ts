import { RouteLocationNormalized } from 'vue-router';
import { forEach } from '../../../../utils/collection';
import { objectEquals } from '../../../../utils/object';
import { RouteLocationDefinition } from '../../../../utils/router';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { $gettext } from '../../../../_common/translate/translate.service';
import { router } from '../../../views/index';

const STORAGE_KEY = 'game-filtering:filters-v2';

interface GameFilteringContainerDefinition {
	label: string;
	type: 'radio' | 'array' | 'string';
	options?: { [k: string]: string };
}

type Params = { [k: string]: string };
type Filters = { [k: string]: any };

export function checkGameFilteringRoute(route: RouteLocationNormalized) {
	const params = route.query;

	let paramFiltersFound = false;
	forEach(params, (value, param) => {
		if (GameFilteringContainer.definitions[param] && value) {
			paramFiltersFound = true;
		}
	});

	// We only do work if the URL is bare with no filters set yet.
	if (!paramFiltersFound && !import.meta.env.SSR) {
		const storageKey = window.sessionStorage.getItem(STORAGE_KEY);
		if (storageKey) {
			console.log('from storage');

			const filters = JSON.parse(storageKey);
			if (filters && !isEmpty(filters)) {
				// Never resolve so we don't switch routes.
				const _filters = getRouteData(filters);
				return getNewRouteLocation(route, _filters);
			}
		}
	}
}

export class GameFilteringContainer {
	static get definitions(): { [k: string]: GameFilteringContainerDefinition } {
		return {
			price: {
				label: $gettext('Price'),
				type: 'radio',
				options: {
					free: $gettext('Free / Name Your Price'),
					sale: $gettext('On Sale'),
					paid: $gettext('Paid'),
					'5-less': $gettext('$5 or less'),
					'15-less': $gettext('$15 or less'),
					'30-less': $gettext('$30 or less'),
				},
			},
			os: {
				label: $gettext('games.filtering.os'),
				type: 'array',
				options: {
					windows: $gettext('games.filtering.os_windows'),
					mac: $gettext('games.filtering.os_mac'),
					linux: $gettext('games.filtering.os_linux'),
					// TODO(vue3) translate-comment="As in other than the rest of the things specified"
					other: $gettext('Other'),
					rom: $gettext('ROM'),
				},
			},
			browser: {
				label: $gettext('games.filtering.browser'),
				type: 'array',
				options: {
					html: $gettext('games.filtering.browser_html'),
					flash: $gettext('games.filtering.browser_flash'),
					unity: $gettext('games.filtering.browser_unity'),
				},
			},
			maturity: {
				label: $gettext('games.filtering.maturity'),
				type: 'array',
				options: {
					everyone: $gettext('games.filtering.maturity_everyone'),
					teen: $gettext('games.filtering.maturity_teen'),
					adult: $gettext('Mature Content'),
				},
			},
			status: {
				// TODO(vue3) translate-comment="As in game development status/stage"
				label: $gettext('Status'),
				type: 'array',
				options: {
					complete: $gettext('Complete/Stable'),
					wip: $gettext('Early Access'),
					devlog: $gettext('Devlog'),
				},
			},
			partners: {
				label: $gettext('Partners'),
				type: 'array',
				options: {
					partners: $gettext('Show Partner Games'),
				},
			},
			query: {
				label: $gettext('Filter'),
				type: 'string',
			},
		};
	}

	filters: Filters = {};

	/**
	 * Whether or not we should store these filters in the browser.
	 */
	isPersistent = false;

	/**
	 * This is whether or not the filters are empty that we need for tags. It
	 * doesn't include the query filter.
	 */
	get areTagFiltersEmpty() {
		return isEmpty(this.filters, { skipQuery: true });
	}

	constructor(route: RouteLocationNormalized) {
		// Default all filters to empty values.
		forEach(GameFilteringContainer.definitions, (definition, key) => {
			if (definition.type === 'array') {
				this.filters[key] = [];
			} else if (definition.type === 'string') {
				this.filters[key] = '';
			} else if (definition.type === 'radio') {
				this.filters[key] = null;
			}
		});

		this.init(route);
	}

	init(route: RouteLocationNormalized) {
		const params = route.query;

		forEach(GameFilteringContainer.definitions, (definition, filter) => {
			if (params[filter]) {
				if (definition.type === 'array') {
					this.filters[filter] = (params[filter] as string).split(',');
				} else if (definition.type === 'string') {
					this.filters[filter] = params[filter];
				} else if (definition.type === 'radio') {
					this.filters[filter] = params[filter];
				}
			} else {
				if (definition.type === 'array') {
					this.filters[filter] = [];
				} else if (definition.type === 'string') {
					this.filters[filter] = '';
				} else if (definition.type === 'radio') {
					this.filters[filter] = null;
				}
			}
		});
	}

	toggleFilterOption(filter: string, option: any) {
		if (
			!GameFilteringContainer.definitions[filter] ||
			GameFilteringContainer.definitions[filter].type === 'string'
		) {
			return;
		}

		// If a radio type, we want to unset any previously set ones.
		if (GameFilteringContainer.definitions[filter].type === 'radio') {
			if (this.filters[filter] === option) {
				this.unsetFilter(filter, option);
			} else {
				this.setFilter(filter, option);
			}
			return;
		}

		if (this.filters[filter].indexOf(option) !== -1) {
			this.unsetFilter(filter, option);
		} else {
			this.setFilter(filter, option);
		}
	}

	setFilter(filter: string, value: any) {
		if (!GameFilteringContainer.definitions[filter]) {
			return;
		}

		const definition = GameFilteringContainer.definitions[filter];

		if (definition.type === 'array') {
			this.filters[filter].push(value);
		} else if (definition.type === 'string' || definition.type === 'radio') {
			this.filters[filter] = value;
		}

		this.saveFilters();
	}

	getFilter(filter: string) {
		if (!GameFilteringContainer.definitions[filter]) {
			return;
		}

		return this.filters[filter];
	}

	unsetFilter(filter: string, option?: any) {
		if (!GameFilteringContainer.definitions[filter]) {
			return;
		}

		const definition = GameFilteringContainer.definitions[filter];

		if (definition.type === 'array') {
			const index = this.filters[filter].findIndex((item: any) => item === option);
			if (index !== -1) {
				this.filters[filter].splice(index, 1);
			}
		} else if (definition.type === 'string') {
			this.filters[filter] = '';
		} else if (definition.type === 'radio') {
			this.filters[filter] = null;
		}

		this.saveFilters();
	}

	isFilterOptionSet(filter: string, option: any) {
		if (
			!GameFilteringContainer.definitions[filter] ||
			GameFilteringContainer.definitions[filter].type === 'string'
		) {
			return null;
		}

		if (GameFilteringContainer.definitions[filter].type === 'radio') {
			return this.filters[filter] === option;
		}

		return this.filters[filter].indexOf(option) !== -1;
	}

	getQueryString(route: RouteLocationNormalized, options: { page?: number } = {}) {
		const queryPieces: string[] = [];

		queryPieces.push('section=' + (route.params.section || 'featured'));

		if (route.query.sort) {
			queryPieces.push('sort=' + route.query.sort);
		}

		if (route.params.tag) {
			queryPieces.push('tag=' + route.params.tag);
		}

		if (route.params.date) {
			queryPieces.push('date=' + route.params.date);
		}

		const page =
			options.page || (route.query.page && parseInt(route.query.page as string)) || 1;
		if (page > 1) {
			queryPieces.push('page=' + page);
		}

		forEach(GameFilteringContainer.definitions, (definition, filter) => {
			if (!this.filters[filter]) {
				return;
			}

			const value = this.filters[filter];

			if (definition.type === 'array' && Array.isArray(value)) {
				if (!value.length) {
					return;
				}

				const filterParam = 'f_' + filter + '[]';
				value.forEach((option: string[]) => {
					queryPieces.push(filterParam + '=' + option);
				});
			} else if (definition.type === 'string' && typeof value === 'string') {
				if (!value || !value.trim()) {
					return;
				}

				queryPieces.push(filter + '=' + value);
			} else if (definition.type === 'radio') {
				if (!value) {
					return;
				}

				queryPieces.push('f_' + filter + '=' + value);
			}
		});

		return queryPieces.join('&');
	}

	/**
	 * When the filters change in any widget.
	 * We want to refresh the page with the new filtering params.
	 */
	onChanged() {
		Scroll.shouldAutoScroll = false;

		const query = getRouteData(this.filters);
		const location = getNewRouteLocation(router.currentRoute.value, query);

		if (location) {
			router.replace(location);
		}
	}

	private saveFilters() {
		// Early out if this isn't a persisent filtering container.
		if (!this.isPersistent && !import.meta.env.SSR) {
			return;
		}

		// We allow them to save/set blank filters as well.
		// This is so they can specifically say not to do our detected OS filters.
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.filters));
	}
}

function getNewRouteLocation(route: RouteLocationNormalized, filters: Filters) {
	const query = Object.assign({}, filters);

	if (!objectEquals(query, route.query)) {
		return {
			name: route.name,
			params: route.params,
			query,
		} as RouteLocationDefinition;
	}
}

function isEmpty(filters: Filters, options: any = {}) {
	let ret = true;
	forEach(filters, (value, key) => {
		if (!GameFilteringContainer.definitions[key]) {
			return;
		}

		const definition = GameFilteringContainer.definitions[key];

		if (definition.type === 'array' && value.length) {
			ret = false;
		} else if (definition.type === 'radio' && value) {
			ret = false;
		} else if (!options.skipQuery && definition.type === 'string' && value.trim()) {
			ret = false;
		}
	});

	return ret;
}

function getRouteData(filters: Filters) {
	const params: Params = {};
	forEach(GameFilteringContainer.definitions, (definition, filter) => {
		if (!filters[filter]) {
			return;
		}

		const value = filters[filter];

		if (definition.type === 'array' && Array.isArray(value)) {
			if (!value.length) {
				return;
			}

			// Make comma delimited lists of values.
			// Sort so the URL is always the same.
			params[filter] = value.sort().join(',');
		} else if (definition.type === 'string' && typeof value === 'string') {
			if (!value.trim()) {
				return;
			}

			params[filter] = value;
		} else if (definition.type === 'radio') {
			if (!value) {
				return;
			}

			params[filter] = value;
		}
	});

	return params;
}
