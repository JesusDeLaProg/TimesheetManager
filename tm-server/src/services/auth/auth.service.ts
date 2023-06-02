import { Inject, Injectable } from '@nestjs/common';
import { USERS } from '//config/constants';
import { CollectionReference } from '@google-cloud/firestore';
import { User } from '//dtos/user';
import * as argon2 from 'argon2';
import { Status } from '//types/status';

@Injectable()
export class AuthService {
    constructor(@Inject(USERS) private Users: CollectionReference<User>) {}

    async login(username: string, password: string): Promise<any> {
        const user = (await this.Users.where('username', '==', username).limit(1).get()).docs[0]?.data();
        if (!user || !user.password) {
            throw new Status(400, 'Utilisateur inexistant');
        }
        if (argon2.verify(user.password, password)) {
            if (argon2.needsRehash(user.password)) {
                this.changePassword(user, password);
            }
            // TODO: Create JWT and return
            return true;
        }
        throw new Status(400, 'Mot de passe incorrect');
    }

    async changePassword(user: User, newPassword: string): Promise<void> {
        await this.Users.doc(user._id).update({ password: await argon2.hash(newPassword) });
    }
}
