import { COOKIE_NAME } from '../../utils/constants';
import type { Route } from '../../utils/interfaces';
import { deleteCookie } from '../../utils/util';
import type { Request, Response } from 'polka';
import { setTimeout as sleep } from 'node:timers/promises';
import { OAuth } from '../../utils/oauth';

export default class implements Route {
  public auth = true;

  public async post(req: Request, res: Response) {
    const result = await OAuth.revoke(req.auth.accessToken);

    if (result === true) return this.removeCookie(res);

    if (typeof result === 'number') {
      await sleep(result);

      const retry = await OAuth.revoke(req.auth.accessToken);

      if (retry === true) return this.removeCookie(res);
    }

    return res.send(500, { success: false, error: 'An error occurred.' });
  }

  private removeCookie(res: Response) {
    deleteCookie(res, COOKIE_NAME);
    res.send(200, { success: true });
  }
}
