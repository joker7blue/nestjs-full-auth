import { Controller, Post, Body, Res, ValidationPipe, Req } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { OAuthService } from '../services/oauth.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OAuthorizeDTO, OTokenDTO } from '../dto';
import { TokenResponse } from '../models/token.model';
import { CustomApiResponse } from '@shared/decorators';

@Controller('oauth')
@ApiTags('OAuth')
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @Post('authorize')
  @ApiResponse({
    status: 302,
    description: 'Redirects to /destination-path',
    headers: {
      Location: {
        description: 'URL to which the client is redirected',
        schema: {
          type: 'string',
          example: '/destination-path',
        },
      },
    },
  })
  async authorize(@Body(new ValidationPipe()) input: OAuthorizeDTO, @Res() res) {
    const { redirectUri } = input;

    // Generate authorization code
    const authorizationCode = await this.oauthService.getAuthorizationCode(input);

    // Redirect to client with the authorization code
    // return res.redirect(`${redirectUri}?code=${authorizationCode}`);
    return res.json({ code: `${redirectUri}?code=${authorizationCode}` });
  }

  @Post('token')
  @CustomApiResponse(TokenResponse)
  async getToken(
    @Body(new ValidationPipe()) body: OTokenDTO,
    @Res() res,
    @Req() req: ExpressRequest,
  ): Promise<TokenResponse> {
    const { code, clientId, codeVerifier } = body;

    // Exchange code for tokens
    const tokens = await this.oauthService.exchangeCodeForTokens(code, clientId, codeVerifier, req);

    return res.json(tokens);
  }
}
