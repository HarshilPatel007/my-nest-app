import { webcrypto } from 'node:crypto';

export class CommonFunctions {
  /**
   * This function generates a random string of a specified length with options for including digits,
   * alphabets, and special characters.
   * @param {number} length - The length parameter is the desired length of the random string to be
   * generated.
   * @param {boolean} digits - A boolean value indicating whether or not to include digits (0-9) in the
   * generated random string.
   * @param {boolean} alphabets - A boolean value indicating whether or not to include alphabets (both
   * uppercase and lowercase) in the generated random string.
   * @param {boolean} specialChar - A boolean value indicating whether or not to include special
   * characters in the generated random string.
   * @returns a randomly generated string of the specified length, consisting of characters from the
   * character set that is created based on the input parameters. The character set can include digits,
   * alphabets, and special characters, depending on the input values.
   * @example generateRandomString(10, true, true, false);
   */
  public generateRandomString(
    length: number,
    digits: boolean,
    alphabets: boolean,
    specialChar: boolean,
  ): string {
    let characterSet = '';

    if (digits) characterSet += '0123456789';
    if (alphabets)
      characterSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    if (specialChar) characterSet += '!#$%&@[\\]{}';

    const randomString: string[] = Array.from(
      webcrypto.getRandomValues(new Uint8Array(length)),
    ).map((value): string => characterSet[value % characterSet.length]);

    return randomString.join('');
  }
}
