import { JwtService } from '@nestjs/jwt';
import { webcrypto } from 'node:crypto';

export class CommonFunctions {
  constructor(private jwtService: JwtService) {}

  /**
   * This function generates and return a random string of a specified length with options for including digits,
   * alphabets (lowercase and uppercase), and special characters.
   * @param {number} length - The length parameter is the desired length of the random string to be
   * generated.
   * @param {boolean} digits - A boolean value indicating whether or not to include digits (0-9) in the
   * generated random string.
   * @param {boolean} alphabetsL - A boolean value indicating whether or not to include lowercase alphabets
   * in the generated random string.
   * @param {boolean} alphabetsU - A boolean value indicating whether or not to include uppercase alphabets
   * in the generated random string.
   * @param {boolean} specialChar - A boolean value indicating whether or not to include special
   * characters in the generated random string.
   * @example
   * generateRandomString(10, true, true, true, false); => `D9g3mbKAlN`
   * generateRandomString(10, true, true, false, false); => `fg3k26li0z`
   * generateRandomString(10, true, false, true, false); => `DWS6FE8DVF`
   * generateRandomString(10, true, false, true, true); => `K2![@3UI$M`
   * generateRandomString(10, true, false, false, false); => `0934955669`
   */
  public generateRandomString(
    length: number,
    digits: boolean,
    alphabetsL: boolean,
    alphabetsU: boolean,
    specialChar: boolean,
  ): string {
    let characterSet = '';

    if (digits) characterSet += '0123456789';
    if (alphabetsL) characterSet += 'abcdefghijklmnopqrstuvwxyz';
    if (alphabetsU) characterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (specialChar) characterSet += '!#$%&@[\\]{}';

    const randomString: string[] = Array.from(
      webcrypto.getRandomValues(new Uint8Array(length)),
    ).map((value): string => characterSet[value % characterSet.length]);

    return randomString.join('');
  }

  public async generateJWTToken(
    obj: object,
    tokenSecret: string,
    TokenExpireTime: string,
  ): Promise<string> {
    const token: string = await this.jwtService.signAsync(obj, {
      secret: tokenSecret,
      expiresIn: TokenExpireTime,
    });

    return token;
  }
}
