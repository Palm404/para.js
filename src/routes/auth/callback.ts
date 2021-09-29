import { COOKIE_NAME } from '../../utils/constants';
import type { OAuthBody, Route } from '../../utils/interfaces';
import { Methods } from '../../utils/interfaces';
import { log } from '../../utils/log';
import type { Request, Response } from 'polka';
import { OAuth } from '../../utils/oauth';

export default class implements Route {
  private readonly allowedGuilds = process.env.ALLOWED_GUILDS.split(' ');

  public async post(req: Request, res: Response) {
    const body = req.body as OAuthBody;

    if (typeof body?.code !== 'string') {
      return res.send(400, { error: 'No code provided.' });
    }

    const data = await OAuth.fetchToken(body);

    if ('error' in data) {
      log(data.error, 'error', {
        path: '/auth/callback',
        method: Methods.Post
      });
      return res.send(500, { error: 'Unable to fetch token.' });
    }

    const auth = OAuth.create(data);

    const user = await auth.fetchUser(this.allowedGuilds);

    if (user === false)
      return res.send(500, { error: 'Unable to fetch user.' });

    res.cookie(COOKIE_NAME, auth.session, {
      maxAge: data.expires_in,
      httpOnly: true,
      path: '/'
    });
    res.send(200, auth.user);
  }
}
