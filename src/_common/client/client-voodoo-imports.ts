let clientVoodoo: typeof import('client-voodoo') = {} as any;

if (GJ_IS_DESKTOP_APP) {
	clientVoodoo = require('client-voodoo');
}

export const {
	Autostarter,
	Config,
	LaunchInstance,
	Launcher,
	Logger,
	Mutex,
	MutexInstance,
	OldLaunchInstance,
	OldLauncher,
	PatchInstance,
	Patcher,
	PatcherState,
	Queue,
	RollbackInstance,
	RollbackState,
	Rollbacker,
	SelfUpdater,
	SelfUpdaterInstance,
	Shortcut,
	State,
	UninstallInstance,
	UninstallState,
	Uninstaller,
	getExecutable,
} = clientVoodoo;
