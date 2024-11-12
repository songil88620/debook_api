import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { UserCreateDto } from 'src/user/dtos';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../../config/service_account.json');

@Injectable()
export class AuthService {
  private firebase_admin;

  constructor(private usersService: UserService) {
    try {
      this.firebase_admin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e) {}
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.firebase_admin
        .auth()
        .verifyIdToken(idToken);
      if (decodedToken) {
        const uid = decodedToken.user_id;
        const phone_number = decodedToken.phone_number;
        const u: UserCreateDto = {
          firebaseId: uid,
          phoneNumber: phone_number,
        };
        return {
          user: await this.usersService.findUser(u),
        };
      } else {
        throw new HttpException(
          { error: { code: 'UNAUTHORIZED' } },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (e) {
      if (e.code == 'auth/id-token-expired') {
        throw new HttpException({ error: { code: 'TOKEN_EXPIRED' } }, 498);
      } else {
        throw new HttpException(
          { error: { code: 'UNAUTHORIZED' } },
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async verifyToken(idToken: string) {
    try {
      const decodedToken = await this.firebase_admin
        .auth()
        .verifyIdToken(idToken);
      return { status: true, data: decodedToken };
    } catch (e) {
      return { status: false, data: e.code };
    }
  }

  // need to left for dev yet
  async refreshToken(r_token: string) {
    try {
      const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`;
      const response = await axios.post(url, {
        grant_type: 'refresh_token',
        refresh_token: r_token,
      });

      const id_token = response.data.id_token;
      return id_token;
    } catch (e) {
      console.log('>>', e.message);
    }
  }
}
