import type { Route } from '../../utils/interfaces';
import { Methods } from '../../utils/interfaces';
import { log } from '../../utils/log';
import type { Request, Response } from 'polka';
import { Sql } from 'postgres';
import { inject, injectable } from 'tsyringe';
import type { ActionHistory } from '../../typings/history';

@injectable()
export default class implements Route {
  public constructor(@inject('sql') private readonly sql: Sql<any>) {}

  public auth = true;

  public async get(req: Request, res: Response) {
    try {
      const rows = await this.sql<ActionHistory[]>`
            select * from history
            where guild = ${req.query.guild}
            `;

      return res.send(200, [...rows]);
    } catch (e: any) {
      log(e, 'error', { path: `/history`, method: Methods.Get });
      return res.send(400, { error: e.message ?? 'An error occurred.' });
    }
  }
}
