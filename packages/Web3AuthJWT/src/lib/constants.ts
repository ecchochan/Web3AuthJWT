export const SIGNIN_MESSAGE = 'I want to sign-in! (`へ´≠)';

export type ClientRequestPayload = {
  payload: string;
  sig: string;
};

export type IdTokenData = {
  uid: string;
  exp: number;
};
