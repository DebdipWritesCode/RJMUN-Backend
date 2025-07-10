import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

@Controller('admin')
export class LoginController {
  private readonly staticCode = '40404';

  @Post('login')
  login(@Body('code') code: string) {
    if (code === this.staticCode) {
      return { message: 'Login successful' };
    } else {
      throw new UnauthorizedException('Invalid code');
    }
  }
}
