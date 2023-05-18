export type Tokens = {
  accessToken: string
  refreshToken: string
}

export type commonRequest = {
  email: string
}

export type forgotPasswordRequest = {
  email: string
  otp: string | number
  newpassword: string
}

export type loginOTPRequest = {
  otp: string | number
}
