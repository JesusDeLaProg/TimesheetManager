import {
  Inject,
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DEFAULT_USER, USERS } from '//config/constants';
import { CollectionReference } from '@google-cloud/firestore';
import { User } from '//dtos/user';
import * as argon2 from 'argon2';
import { plainToInstance } from 'class-transformer';
import { IUser } from '//types/models/datamodels';

export interface JwtTokenPayload {
  name: string;
  sub: string;
  iss: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS) private Users: CollectionReference<User>,
    @Inject(DEFAULT_USER) debugUser: IUser | null,
    private jwtService: JwtService,
  ) {
    if (debugUser) {
      console.log('Debug user provided, looking for its existence. User: ', debugUser);
      Users.where('username', '==', debugUser.username)
        .limit(1)
        .get()
        .then((res) => {
          if (res.empty) {
            console.log('Debug user does not exist. Creating it.');
            const u = plainToInstance(User, debugUser);
            const newPass = u.password;
            delete u.password;
            Users.add(u).then((result) => {
              u._id = result.id;
              this.changePasswordForDebugUser(u, newPass);
            });
          }
        });
    }
  }

  async login(username: string, password: string): Promise<User> {
    const user = (
      await this.Users.where('username', '==', username)
        .where('isActive', '==', true)
        .limit(1)
        .get()
    ).docs[0]?.data();
    if (!user || !user.password) {
      throw new BadRequestException('Utilisateur inexistant');
    }
    if (argon2.verify(user.password, password)) {
      if (argon2.needsRehash(user.password)) {
        await this.Users.doc(user._id).update({
          password: await argon2.hash(password),
        });
      }
      delete user.password;
      return user;
    }
    throw new UnauthorizedException('Mot de passe incorrect');
  }

  async changePassword(
    authUser: User,
    user: User,
    newPassword: string,
    oldPassword?: string,
  ): Promise<void> {
    if (
      authUser.role > user.role ||
      (authUser._id === user._id && argon2.verify(user.password, oldPassword))
    ) {
      const p = await argon2.hash(newPassword);
      await this.Users.doc(user._id).update({
        password: p,
      });
      user.password = p;
    } else {
      throw new ForbiddenException(
        `Changement de mot de passe refusé sur utilisateur ${user._id}`,
      );
    }
  }

  async generateJwt(
    user: User,
  ): Promise<{ payload: JwtTokenPayload; token: string }> {
    const payload = {
      name: `${user.firstName} ${user.lastName}`,
      sub: user._id,
    };
    return {
      payload: payload as JwtTokenPayload,
      token: await this.jwtService.signAsync(payload),
    };
  }

  async changePasswordForDebugUser(user: User, newPassword: string) {
    if (
      [user.username, user.firstName, user.lastName].every((s) => s === 'admin')
    ) {
      const p = await argon2.hash(newPassword);
      await this.Users.doc(user._id).update({
        password: p,
      });
      user.password = p;
    }
  }
}
