import { arrayUnique } from '../../../utils/array';
import { Api } from '../../../_common/api/api.service';
import { Geo } from '../../../_common/geo/geo.service';
import { $gettext } from '../../../_common/translate/translate.service';
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

export class SiteAnalyticsReport {
	isLoaded = false;

	constructor(public title: string, public components: ReportComponent[]) {}

	init(
		resource: ResourceName,
		resourceId: number,
		collection: Collection,
		partnerMode: boolean,
		viewAs: number | undefined,
		startTime: number | undefined,
		endTime: number | undefined
	) {
		const promises = this.components.map(component => {
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
			if (conditionFields.indexOf('partner') !== -1) {
				conditions.push('has-partner');
			}
			if (conditionFields.indexOf('partner_generated_revenue') !== -1) {
				conditions.push('has-partner');
			}
			if (conditionFields.indexOf('partner_generated_donation') !== -1) {
				conditions.push('has-donations', 'has-partner');
			}
			if (partnerMode) {
				conditions.push('partner');
			}
			conditions = arrayUnique(conditions);

			// Replace the pseudo fields by their normal fields
			if (field === 'partner_generated_revenue') {
				field = 'revenue';
			} else if (field === 'partner_generated_donation') {
				field = 'donation';
			}

			if (fetchFields) {
				fetchFields = fetchFields.map(fetchField => {
					let result: Field;
					if (fetchField === 'partner_generated_revenue') {
						result = 'revenue';
					} else if (fetchField === 'partner_generated_donation') {
						result = 'donation';
					} else {
						result = fetchField;
					}
					return result;
				});
			}

			return this.sendComponentRequest(
				resource,
				resourceId,
				collection,
				analyzer,
				field,
				viewAs,
				partnerMode,
				conditions,
				fetchFields,
				component.resourceFields,
				startTime,
				endTime
			);
		});

		Promise.all(promises).then((componentResponses: any) => {
			this.isLoaded = true;

			this.components.forEach((component, i) => {
				const response = this.processComponentResponse(
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
	}

	private sendComponentRequest(
		resource: ResourceName,
		resourceId: number,
		collection: Collection,
		analyzer: Analyzer,
		field: Field,
		viewAs: number | undefined,
		partnerMode: boolean | undefined,
		conditions: Condition[] | undefined,
		fetchFields: Field[] | undefined,
		resourceFields: ResourceFields | undefined,
		startTime: number | undefined,
		endTime: number | undefined
	) {
		const request: Request = {
			target: resource,
			target_id: resourceId,
			collection: collection,
			analyzer: analyzer,
			field: field,
		};

		if (viewAs) {
			request.view_as = viewAs;
		}

		if (partnerMode) {
			request.as_partner = partnerMode;
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

		return Api.sendRequest(
			'/web/dash/analytics/display',
			{ data: request },
			{ sanitizeComplexData: false }
		);
	}

	private processComponentResponse(component: ReportComponent, _response: any, gathers?: any) {
		const field = component.field,
			analyzer = component.type,
			displayField = component.displayField;

		// Copy the response.
		const response: any = Object.assign({}, _response);
		let graph: any = null;
		let data: any = {};

		// We return "simple" single value analyzations as is.
		if (analyzer === 'sum' || analyzer === 'average') {
			response.result = response.result || 0;
			return response;
		}

		// For top compositions we convert the { key: value } to [ { label: key, value: value } ]
		if (
			analyzer === 'top-composition' ||
			analyzer === 'top-composition-sum' ||
			analyzer === 'top-composition-avg'
		) {
			// Rating is a special case of top composition. We want to keep processing it as { key: value } and not convert it.
			if (field !== 'rating') {
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
			} else {
				// Make sure all the rating values are filled in, and in the correct order
				data = {};
				[1, 2, 3, 4, 5].forEach(rating => {
					data[rating] = response.result[rating] || 0;
				});
				response.result = data;
			}

			// Top composition fields may refer to gathered fields. In this case replace them in now.
			if (gathers && displayField) {
				for (const dataEntry of response.result) {
					const resourceInfo: string[] = dataEntry.label.split('-');
					const resourceName = resourceInfo[0],
						resourceId = parseInt(resourceInfo[1], 10);
					const displayValue = gathers[resourceName][resourceId][displayField];

					switch (resourceName) {
						case 'game':
							dataEntry.label = {
								resource: 'Game',
								resourceId: resourceId,
								value: displayValue,
							};
							break;

						case 'user':
							dataEntry.label = {
								resource: 'User',
								resourceId: resourceId,
								value: displayValue,
							};
							break;

						case 'partner':
						case 'creator_supporter':
						case 'fireside_post':
						case 'fireside':
							dataEntry.label = displayValue;
							break;
					}
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
}
