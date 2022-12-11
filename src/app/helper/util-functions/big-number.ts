export class BigStringInteger {
  constructor(readonly value: string) {
    if ([',', '.', 'e'].some((c) => value.includes(c))) {
      throw Error('Wrong input');
    }
  }
  // https://www.geeksforgeeks.org/sum-two-large-numbers/?ref=lbp
  add(other: BigStringInteger): BigStringInteger {
    // Before proceeding further, make sure length
    // of str2 is larger.
    var str1 = this.value;
    var str2 = other.value;
    if (str1.length > str2.length) {
      let temp = str1;
      str1 = str2;
      str2 = temp;
    }

    // Take an empty string for storing result
    let str = '';

    // Calculate length of both string
    let n1 = str1.length,
      n2 = str2.length;
    let diff = n2 - n1;
    // Initially take carry zero
    let carry = 0;

    // Traverse from end of both strings
    for (let i = n1 - 1; i >= 0; i--) {
      // Do school mathematics, compute sum of
      // current digits and carry
      // console.log((str1.charCodeAt(i)-48),(str2.charCodeAt(i+diff)-48))
      let sum =
        str1.charCodeAt(i) - 48 + (str2.charCodeAt(i + diff) - 48) + carry;
      str += sum % 10;
      carry = Math.floor(sum / 10);
    }

    // // Add remaining digits of str2[]
    for (let i = n2 - n1 - 1; i >= 0; i--) {
      let sum = str2.charCodeAt(i) - 48 + carry;
      str += sum % 10;
      carry = Math.floor(sum / 10);
    }

    // Add remaining carry
    if (carry) str += carry + '0';

    // reverse resultant string

    str = str.split('').reverse().join('');

    return new BigStringInteger(str);
  }

  // https://www.geeksforgeeks.org/multiply-large-numbers-represented-as-strings/
  multiply(other: BigStringInteger) {
    let len1 = this.value.length;
    let len2 = other.value.length;
    if (len1 == 0 || len2 == 0) return new BigStringInteger('0');

    // will keep the result number in vector
    // in reverse order
    let result = new Array(len1 + len2).fill(0);

    // Below two indexes are used to
    // find positions in result.
    let i_n1 = 0;
    let i_n2 = 0;

    // Go from right to left in num1
    for (var i = len1 - 1; i > -1; i--) {
      let carry = 0;
      let n1 = this.value[i].charCodeAt(0) - 48;

      // To shift position to left after every
      // multiplication of a digit in num2
      i_n2 = 0;

      // Go from right to left in num2
      for (var j = len2 - 1; j > -1; j--) {
        // Take current digit of second number
        let n2 = other.value[j].charCodeAt(0) - 48;

        // Multiply with current digit of first number
        // and add result to previously stored result
        // at current position.
        let summ = n1 * n2 + result[i_n1 + i_n2] + carry;

        // Carry for next iteration
        carry = Math.floor(summ / 10);

        // Store result
        result[i_n1 + i_n2] = summ % 10;

        i_n2 += 1;
      }

      // store carry in next cell
      if (carry > 0) result[i_n1 + i_n2] += carry;

      // To shift position to left after every
      // multiplication of a digit in num1.
      i_n1 += 1;

      // print(result)
    }
    // ignore '0's from the right
    i = result.length - 1;
    while (i >= 0 && result[i] == 0) i -= 1;

    // If all were '0's - means either both or
    // one of num1 or num2 were '0'
    if (i == -1) return new BigStringInteger('0');

    // generate the result string
    let s = '';
    while (i >= 0) {
      s += String.fromCharCode(result[i] + 48);
      i -= 1;
    }

    return new BigStringInteger(s);
  }

  mod(a: number) {
    // Initialize result
    let res = 0;

    // One by one process
    // all digits of 'num'
    for (let i = 0; i < this.value.length; i++)
      res = (res * 10 + parseInt(this.value[i])) % a;

    return res;
  }

  toNumber() {
    return Number(this.value);
  }

  toBigInt() {
    return BigInt(this.value);
  }

  static fromNumber(value: number): BigStringInteger {
    return new BigStringInteger(Math.round(value).toString());
  }

  static fromBigInt(value: bigint): BigStringInteger {
    return new BigStringInteger(value.toString());
  }
}
