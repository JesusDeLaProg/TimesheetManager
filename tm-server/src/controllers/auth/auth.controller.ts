import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '//services/auth/auth.service';
import { LocalAuthGuard, Public } from '//passport/guards';
import { Response } from 'express';
import { TM_AUTH_COOKIE } from '//config/constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { payload, token } = await this.authService.generateJwt(req.user);
    res.cookie(TM_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 3600 * 1000,
    });
    return payload;
  }

  @Post('change-password')
  async changePassword(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { payload, token } = await this.authService.generateJwt(req.user);
    res.cookie(TM_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 3600 * 1000,
    });
    return payload;
  }

  @Public()
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TM_AUTH_COOKIE);
  }
}
