import type { ActionHistory } from '../typings/history';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import type { Methods } from './interfaces';
import { log } from './log';

export async function createHistory(payload: ActionHistory) {
  const sql = container.resolve<Sql<any>>('sql');
  await sql<ActionHistory[]>`
	insert into history
    ${sql(payload as any, ...Object.keys(payload))}
	`;
}

export function history(path: string): MethodDecorator {
  return (_target, key, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = async function methodWithHistory(...args: any[]) {
      const result: ActionHistory = await method.apply(this, args);
      if (
        result != null &&
        typeof result === 'object' &&
        Reflect.has(result, 'action')
      ) {
        void createHistory(result).catch(e =>
          log(e, 'error', { path, method: key as Methods })
        );
      }
    };
  };
}
