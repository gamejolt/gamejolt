/*@ngInject*/
export function SiteSettingsFormFactory(
	Form: any,
)
{
	const form = new Form( {
		model: 'Site',
		template: require( './settings.html' ),
	} );

	return form;
}
