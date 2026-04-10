import { service } from '@ember/service';
import type { NextFn } from '@warp-drive/core/request';
import type { RequestContext } from '@warp-drive/core/types/request';
import type SessionService from 'ember-simple-auth/services/session';

export default class AuthHandler {
  @service declare session: SessionService;

  request<T>(context: RequestContext, next: NextFn<T>) {
    const headers = new Headers(context.request.headers);

    const isBinaryRequest = headers.get('X-Response-Type') === 'blob';

    if (context.request.body instanceof FormData || isBinaryRequest) {
      headers.delete('Content-Type');
    } else {
      headers.append('Content-Type', 'application/json');
    }

    headers.delete('X-Response-Type');

    const authData = this.session.data.authenticated as Record<string, unknown>;
    const accessToken = (authData?.['data'] as Record<string, unknown>)?.[
      'accessToken'
    ] as string | undefined;

    headers.append('Authorization', accessToken ? `Bearer ${accessToken}` : '');
    return next(Object.assign({}, context.request, { headers }));
  }
}
