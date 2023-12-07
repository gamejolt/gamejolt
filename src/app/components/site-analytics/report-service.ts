import { Ref, readonly, ref } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import { Geo } from '../../../_common/geo/geo.service';
import { $gettext } from '../../../_common/translate/translate.service';
import { UserModel } from '../../../_common/user/user.model';
import { arrayUnique } from '../../../utils/array';
import {
	Analyzer,
	Collection,
	Condition,
	Field,
	ReportComponent,
	Request,
	ResourceFields,
	ResourceName,
} from './site-analytics-service';

export type SiteAnalyticsReport = ReturnType<typeof createSiteAnalyticsReport>;

export function createSiteAnalyticsReport(options: {
	title: string;
	components: ReportComponent[];
	resource: ResourceName;
	resourceId: number;
	collection: Collection;
	viewAs: UserModel | undefined;
	startTime: number | undefined;
	endTime: number | undefined;
}) {
	const { title, resource, resourceId, collection, viewAs, startTime, endTime } = options;

	const isLoaded = ref(false);

	// The below async code will end up populating fields on the components, so
	// it needs to be reactive.
	const components = ref(options.components) as Ref<ReportComponent[]>;

	const promises = components.value.map(component => {
		let analyzer = component.type;
		if (analyzer === 'rating-breakdown') {
			analyzer = 'top-composition';
		}

		let conditions: Condition[] = [];
		let field = component.field,
			fetchFields = component.fetchFields;

		// Conditions are added based on the fields that we're searching on in either the component.field or component.fetchFields fields.
		let conditionFields = [field];
		if (fetchFields) {
			conditionFields = conditionFields.concat(fetchFields);
		}

		if (conditionFields.indexOf('source_url') !== -1) {
			conditions.push('source-external');
		}
		if (conditionFields.indexOf('donation') !== -1) {
			conditions.push('has-donations');
		}
		if (
			conditionFields.indexOf('gem_amount') !== -1 ||
			conditionFields.indexOf('gem_recipient') !== -1
		) {
			conditions.push('gem-purchases-only');
		}
		conditions = arrayUnique(conditions);

		return _sendComponentRequest(
			analyzer,
			field,
			conditions,
			fetchFields,
			component.resourceFields,
			component.size
		);
	});

	Promise.all(promises).then((componentResponses: any) => {
		isLoaded.value = true;

		components.value.forEach((component, i) => {
			const response = _processComponentResponse(
				component,
				componentResponses[i].data,
				componentResponses[i].gathers
			);

			component.data = response.result;
			component.graph = response.graph;
			component.total = response.total;

			if (component.type === 'sum' || component.type === 'average') {
				component.hasData =
					typeof component.data !== 'undefined' && component.data !== null;
			} else {
				component.hasData = component.data && Object.keys(component.data).length > 0;
			}
		});
	});

	function _sendComponentRequest(
		analyzer: Analyzer,
		field: Field,
		conditions: Condition[] | undefined,
		fetchFields: Field[] | undefined,
		resourceFields: ResourceFields | undefined,
		size: number | undefined
	) {
		const request: Request = {
			target: resource,
			target_id: resourceId,
			collection,
			analyzer,
			field,
		};

		if (viewAs) {
			request.view_as = viewAs.id;
		}

		if (conditions) {
			request.conditions = conditions;
		}

		if (fetchFields) {
			request.fetch_fields = fetchFields;
		}

		if (resourceFields) {
			request.resource_fields = [];
			// Resource fields has different string union types as values, and
			// typescript can't infer it as a merged string union yet.
			for (const k of Object.keys(resourceFields)) {
				request.resource_fields.push(...(resourceFields as any)[k]);
			}
		}

		if (startTime && endTime) {
			const date = new Date();
			request.from_date = startTime / 1000;
			request.to_date = endTime / 1000;
			request.timezone = date.getTimezoneOffset();
		}

		if (size) {
			request.size = size;
		}

		return Api.sendRequest(
			'/web/dash/analytics/display',
			{ data: request },
			{ sanitizeComplexData: false }
		);
	}

	function _processComponentResponse(component: ReportComponent, _response: any, gathers?: any) {
		const { field, type: analyzer, displayField } = component;

		// Copy the response.
		const response: any = { ..._response };
		let graph: any = null;
		let data: any = {};

		// We return "simple" single value analyzations as is.
		if (analyzer === 'sum' || analyzer === 'average') {
			response.result = response.result || 0;
			return response;
		}

		// Right now it's pretty simple. We literally just support returning a
		// list of users, but this should be expanded in the future to allow
		// showing any type of data with multiple columns instead of just
		// picking out the first one.
		if (analyzer === 'ordered-asc' || analyzer === 'ordered-desc') {
			const data = [];
			for (const row of Object.values(response)) {
				// We only support showing the first column returned currently.
				const rowData = Object.values(row as any)[0];
				if (!rowData) {
					continue;
				}

				data.push({
					label: _getGatheredData(rowData as string, displayField!, gathers),
				});
			}

			response.result = data;
			return response;
		}

		// For top compositions we convert the { key: value } to [ { label: key, value: value } ]
		if (
			analyzer === 'top-composition' ||
			analyzer === 'top-composition-sum' ||
			analyzer === 'top-composition-avg'
		) {
			// Rating is a special case of top composition. We want to keep processing it as { key: value } and not convert it.
			if (field === 'rating') {
				// Make sure all the rating values are filled in, and in the correct order
				data = {};
				[1, 2, 3, 4, 5].forEach(rating => {
					data[rating] = response.result[rating] || 0;
				});
				response.result = data;
			} else {
				data = [];
				Object.entries(response.result).forEach((kv: any) => {
					// eslint-disable-next-line prefer-const
					let [key, val] = kv;

					switch (analyzer) {
						case 'top-composition-sum':
							val = val.sum;
							break;

						case 'top-composition-avg':
							val = val.avg;
							break;
					}

					data.push({
						label: key,
						value: val,
					});
				});
				response.result = data;
			}

			// Top composition fields may refer to gathered fields. In this case replace them in now.
			if (gathers && displayField) {
				for (const dataEntry of response.result) {
					dataEntry.label = _getGatheredData(dataEntry.label, displayField, gathers);
				}
			}

			// country code => country name
			if (field === 'country') {
				Object.values(response.result).forEach((val: any) => {
					if (val.label === 'other') {
						val.label = $gettext(`Unknown`);
					} else {
						val.label = Geo.getCountryName(val.label) || val.label;
					}
				});
			}

			// All fields except 'rating' and 'source_url' expect to also display the graph (doughnut piechart)
			if (field !== 'rating' && field !== 'source_url') {
				graph = [];
				for (let i = 0; i < Math.min(response.result.length, 3); i++) {
					const dataEntry = response.result[i];
					graph.push({
						label:
							typeof dataEntry.label === 'object'
								? dataEntry.label.value
								: dataEntry.label,
						value: dataEntry.value,
					});
				}
				response.graph = graph;
			}
		}

		return response;
	}

	function _getGatheredData(
		fieldLabel: string,
		displayField: string,
		gathers: Record<string, any>
	) {
		const resourceInfo: string[] = fieldLabel.split('-');
		const resourceName = resourceInfo[0],
			resourceId = parseInt(resourceInfo[1], 10);
		const gatheredData = gathers[resourceName][resourceId];
		const displayValue = gatheredData[displayField];

		switch (resourceName) {
			case 'game':
				return {
					resource: 'Game',
					resourceId: resourceId,
					value: displayValue,
					isAnalyticsEntry: true,
				};

			case 'user':
				return {
					resource: 'User',
					resourceId: resourceId,
					value: displayValue,
					isAnalyticsEntry: true,
					gathers: {
						user: gatheredData.user_model
							? new UserModel(gatheredData.user_model)
							: null,
					},
				};

			case 'creator_supporter':
			case 'invited_user':
				return {
					resource: 'User',
					resourceId: resourceId,
					value: displayValue,
					isAnalyticsEntry: false,
					gathers: {
						user: gatheredData.user_model
							? new UserModel(gatheredData.user_model)
							: null,
					},
				};

			case 'fireside_post':
				return {
					resource: 'Fireside_Post',
					resourceId: resourceId,
					value: displayValue,
					isAnalyticsEntry: false,
					gathers: {
						post: gatheredData.post_model
							? new FiresidePostModel(gatheredData.post_model)
							: null,
					},
				};

			case 'fireside':
				return displayValue;

			case 'shop_product':
				return {
					resource: 'Inventory_Shop_Product',
					resourceId: resourceId,
					value: displayValue,
					// Brands currently can't view shop product analytics since
					// it only shows gems and they don't receive gems.
					isAnalyticsEntry: viewAs?.is_brand ? false : true,
				};
		}
	}

	return readonly({
		title,
		components,
		isLoaded,
	});
}
