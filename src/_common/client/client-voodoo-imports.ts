let clientVoodoo: typeof import('client-voodoo') = {} as any;

if (GJ_IS_DESKTOP_APP) {
	clientVoodoo = require('client-voodoo');
}

export const Autostarter = clientVoodoo.Autostarter;
export const Config = clientVoodoo.Config;
export const LaunchInstance = clientVoodoo.LaunchInstance;
export const Launcher = clientVoodoo.Launcher;
export const Logger = clientVoodoo.Logger;
export const Mutex = clientVoodoo.Mutex;
export const MutexInstance = clientVoodoo.MutexInstance;
export const OldLaunchInstance = clientVoodoo.OldLaunchInstance;
export const OldLauncher = clientVoodoo.OldLauncher;
export const PatchInstance = clientVoodoo.PatchInstance;
export const Patcher = clientVoodoo.Patcher;
export const PatcherState = clientVoodoo.PatcherState;
export const Queue = clientVoodoo.Queue;
export const RollbackInstance = clientVoodoo.RollbackInstance;
export const RollbackState = clientVoodoo.RollbackState;
export const Rollbacker = clientVoodoo.Rollbacker;
export const SelfUpdater = clientVoodoo.SelfUpdater;
export const SelfUpdaterInstance = clientVoodoo.SelfUpdaterInstance;
export const Shortcut = clientVoodoo.Shortcut;
export const State = clientVoodoo.State;
export const UninstallInstance = clientVoodoo.UninstallInstance;
export const UninstallState = clientVoodoo.UninstallState;
export const Uninstaller = clientVoodoo.Uninstaller;
export const getExecutable = clientVoodoo.getExecutable;
