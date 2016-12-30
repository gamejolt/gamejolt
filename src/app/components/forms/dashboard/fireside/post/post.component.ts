export function FiresidePostFormFactory(
	Form: any,
)
{
	const form = new Form( {
		model: 'Fireside_Post',
		template: '/app/components/forms/dashboard/fireside/post/post.component.html',
	} );

	return form;
}
