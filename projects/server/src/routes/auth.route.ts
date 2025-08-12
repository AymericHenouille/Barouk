import { Router, type Request, type Response } from 'express';
import type GoogleAuthService from '../services/google-auth.service.js';

export default function(googleAuthService: GoogleAuthService): Router {
  const router = Router({ });
  router.get('/google', (request: Request, response: Response) => {
    const redirectUrl = googleAuthService.generateAuthUrl(request);
    response.redirect(redirectUrl);
  });
  router.get('/google/callback', async (request: Request, response: Response) => {
    try {
      await googleAuthService.handleOAuthCallBack(request);
      response.redirect('/success');
    } catch (error) {
      console.error(error);
      response.redirect('/failure');
    }
  });
  return router;
}
