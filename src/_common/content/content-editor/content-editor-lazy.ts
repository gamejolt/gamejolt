export async function AppContentEditorLazy() {
	return await import(/* webpackChunkName: "contentEditor" */ './content-editor.vue');
}
