import {
  Inject,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USERS } from '//config/constants';
import { CollectionReference } from '@google-cloud/firestore';
import { User } from '//dtos/user';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS) private Users: CollectionReference<User>,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<User> {
    const user = (
      await this.Users.where('username', '==', username).where('isActive', '==', true).limit(1).get()
    ).docs[0]?.data();
    if (!user || !user.password) {
      throw new BadRequestException('Utilisateur inexistant');
    }
    if (argon2.verify(user.password, password)) {
      if (argon2.needsRehash(user.password)) {
        this.changePassword(user, password);
      }
      delete user.password;
      return user;
    }
    throw new UnauthorizedException('Mot de passe incorrect');
  }

  async changePassword(user: User, newPassword: string): Promise<void> {
    await this.Users.doc(user._id).update({
      password: await argon2.hash(newPassword),
    });
  }

  async generateJwt(user: User): Promise<{payload: {name: string, sub: string}, token: string}> {
    const payload = {
      name: `${user.firstName} ${user.lastName}`,
      sub: user._id,
    };
    return { payload, token: await this.jwtService.signAsync(payload) };
  }
}
