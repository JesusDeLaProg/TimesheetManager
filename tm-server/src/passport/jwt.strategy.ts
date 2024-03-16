import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PUBLIC_KEY, TM_AUTH_COOKIE, USERS } from '//config/constants';
import { CollectionReference } from '@google-cloud/firestore';
import { User } from '//dtos/user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USERS) private users: CollectionReference<User>,
    @Inject(PUBLIC_KEY) publicKey: string,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          console.log(`Cookies set on the request: ${Object.keys(req.cookies)}`);
          return req.cookies[TM_AUTH_COOKIE];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: publicKey,
      issuer: 'Cloud Timesheet-Manager',
    });
  }

  async validate(payload: { sub: string }) {
    return (await this.users.doc(payload.sub).get()).data();
  }
}
