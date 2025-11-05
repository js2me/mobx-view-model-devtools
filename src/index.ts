import { ViewModelDevtools } from './model';

export { ViewModelDevtools };

if (buildEnvs.version === 'global') {
  Object.assign(globalThis, {
    ViewModelDevtools,
  });
}
