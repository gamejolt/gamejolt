/*@ngInject*/
export function SiteDomainFormFactory(Form: any) {
	const form = new Form({
		model: 'Site',
		template: require('./domain.html'),
	});

	return form;
}
