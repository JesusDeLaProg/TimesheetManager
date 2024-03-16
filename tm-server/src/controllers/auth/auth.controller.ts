import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '//services/auth/auth.service';
import { LocalAuthGuard, Public } from '//passport/guards';
import { Response } from 'express';
import { TM_AUTH_COOKIE } from '//config/constants';
import { AuthenticatedUser } from '//decorators/user.decorator';
import { User } from '//dtos/user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { payload, token } = await this.authService.generateJwt(req.user);
    res.cookie(TM_AUTH_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 3600 * 1000,
    });
    return payload;
  }

  @Post('change-password')
  async changePassword(
    @AuthenticatedUser() user: User,
    @Body('newPassword') newPassword: string,
    @Body('oldPassword') oldPassword: string,
  ) {
    await this.authService.changePassword(user, user, newPassword, oldPassword);
  }

  @Public()
  @Get('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(TM_AUTH_COOKIE);
  }
}
