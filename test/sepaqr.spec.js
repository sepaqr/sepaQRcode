'use strict';
// specs from EPC069-12, V2.0 2 July 2015
// @see url: http://www.europeanpaymentscouncil.eu/index.cfm/knowledge-bank/epc-documents/quick-response-code-guidelines-to-enable-data-capture-for-the-initiation-of-a-sepa-credit-transfer/epc069-12-quick-response-code-guidelines-to-enable-the-data-capture-for-the-initiation-of-a-sepa-credit-transferpdf/

// QR code level M
// Maximum QRcode version 13 (=69x69 modules)
describe("the empty sepaqr object", function() {
  // M 3..3a 3 Service Tag: ‘BCD’

  it("should contain the mandatory Service Tag", function() {
    var sepaqr = new sepaQR();

    expect(sepaqr.validServiceTag()).toBe(true);
  });

  // M 3..3an 3 Version: ‘002’

  it("should contain the mandatory Version String", function() {
    var sepaqr = new sepaQR();

    expect(sepaqr.validVersion()).toBe(true);
  });

  // M 3..3an 3 Identification code: ‘SCT’
  it("should contain the mandatory Identification Code", function() {
    var sepaqr = new sepaQR();

    expect(sepaqr.validIdentificationCode()).toBe(true);
  });

  // M 1..1an 1 Character set
  it("should have a valid charset", function() {
    var sepaqr = new sepaQR();

    expect(sepaqr.validCharset()).toBe(true);
  });

  it("should fail other mandatory properties", function() {
    var sepaqr = new sepaQR();

    expect(sepaqr.validBenefName).toThrowError(Error);
    expect(sepaqr.validBenefAccNr).toThrowError(Error);
  });

  it("should accept empty optional properties", function() {
    var sepaqr = new sepaQR();

    expect(sepaqr.validAmountEuro()).toBe(true);
  });



});

// DATA FIELDS:
describe("testing with single properties", function() {

  // O 3..3an,1..12n 12 AT-04 Amount of the Credit Transfer in Euro
  // Note: Usage Rule: Amount must be 0.01 or more and 999999999.99 or less
  it("should accept currency amounts up to 12 digits", function() {
    var sepaqr = new sepaQR({
      amountEuro: 999999999.99
    });

    expect(sepaqr.validAmountEuro()).toBe(true);
  });

  it("should fail for currency amounts =0.0", function() {
    var sepaqr = new sepaQR({
      amountEuro: 0
    });

    expect(sepaqr.validAmountEuro).toThrowError(Error);
  });

  it("should fail for non-currency values", function() {
    var sepaqr = new sepaQR({
      amountEuro: "9d9999999.99"
    });

    expect(sepaqr.validAmountEuro()).toBe(false);
  });

  // M 1..70an 70 AT-21 Name of the Beneficiary
  it("should fail for beneficiaryName >70 chars", function() {
    var sepaqr = new sepaQR({
      beneficiaryName: "‘Name’ is limited to 70 characters in length. Here are some more to it."
    });
    expect(sepaqr.validBenefName).toThrowError(Error);
  });

  // M 1..34an AT-20 Account number of the Beneficiary
  it("should fail for beneficiaryAccNr >34 chars", function() {
    var sepaqr = new sepaQR({
      beneficiaryAccNr: "DE71110220330123456789...some more."
    });
    expect(sepaqr.validBenefAccNr).toThrowError(Error);
  });

  // O 1..70an 70 Beneficiary to originator information

  it("should fail for originator information >70 chars", function() {
    var sepaqr = new sepaQR({
      information: "‘Name’ is limited to 70 characters in length. Here are some more to it."
    });
    expect(sepaqr.validInformation).toThrowError(Error);
  });

  // O 1..4an 4 (AT-44 Purpose of the Credit Transfer)
  it("should allow empty or 4-character Purpose", function() {
    var sepaqr = new sepaQR();
    expect(sepaqr.validPurpose()).toBe(true);

    var sepaqr1 = new sepaQR({
      purpose: "ABCD"
    });
    expect(sepaqr1.validPurpose()).toBe(true);

  });

  it("should fail on 5-character purpose", function() {
    var sepaqr1 = new sepaQR({
      purpose: "ABCDE"
    });
    expect(sepaqr1.validPurpose).toThrowError(Error);
  });

  // O/M 8/11an 11 AT-23 BIC
  it("should allow empty BIC or max. 11chars ", function() {
    var sepaqr1 = new sepaQR();
    expect(sepaqr1.validBenefBic()).toBe(true);
    var sepaqr2 = new sepaQR({
      benefBIC: "123456789ab"
    });
    expect(sepaqr2.validBenefBic()).toBe(true);
  });


  // O {Or 1..35an 35 Creditor Reference (RF Creditor Reference may be used,ISO 11649)
  // O Or} 1..140an 140 (AT-05 Remittance Information) Unstructured Remittance information Usage Rule: ‘Unstructured’ may carry structured  remittance information, as agreed between the Originatorand the Beneficiary.
  it("should only accept either CredRef or Remittence", function() {
    var sepaqr1 = new sepaQR({
      creditorRef: "abcd",
      remittanceInf: "abcd"
    });
    expect(sepaqr1.validCreditorRefOrRemittance).toThrowError(Error);

    var sepaqr2 = new sepaQR({
      creditorRef: "‘CredRef’ is limited to 35 charact"
    });
    expect(sepaqr2.validCreditorRefOrRemittance()).toBe(true);

    var sepaqr2 = new sepaQR({
      remittanceInf: "‘RemittanceInf is limited to 70 characters in length. Here are some m"
    });
    expect(sepaqr2.validCreditorRefOrRemittance()).toBe(true);

  });

});

describe("the epc demonstrator qrcode from the spec", function() {
  var sepaqr = new sepaQR({
    charset: sepaQR.Charset.UTF_8,
    version: '001',
    benefName: 'Franz Mustermänn',
    benefBIC: 'BHBLDEHHXXX',
    benefAccNr: 'DE71110220330123456789',
    amountEuro: 12.3,
    purpose: 'GDDS',
    creditorRef: 'RF18539007547034',
    information: ''
  });

  it("should be a valid Beneficiary", function() {
    expect(sepaqr.validBenefName()).toBe(true);
    expect(sepaqr.validBenefBic()).toBe(true);
    expect(sepaqr.validBenefAccNr()).toBe(true);
  });

  it("should be a valid Amount", function() {
    expect(sepaqr.validAmountEuro()).toBe(true);
  });

  it("should be a valid purpose", function() {
    expect(sepaqr.validPurpose()).toBe(true);
  });

  it("should be a valid CredRef", function() {
    expect(sepaqr.validCreditorRefOrRemittance()).toBe(true);
  });

  it("should be a valid info", function() {
    expect(sepaqr.validInformation()).toBe(true);
  });

  it("should be a valid payload", function() {
    expect(sepaqr.valid()).toBe(true);
  });

  it("should yield the same text as in the spec", function() {
    expect(sepaqr.toQRText()).toBe('BCD\n001\n1\nSCT\nBHBLDEHHXXX\nFranz Mustermänn\nDE71110220330123456789\nEUR12.3\nGDDS\nRF18539007547034');
  });

  it("should have the same payload length", function() {
    expect(sepaqr.toQRText().length).toBe(95);
  });

});

// Finnish Spec: https://www.fkl.fi/en/material/publications/Publications/QR_code_in_credit_transfer_form.pdf

describe("the finnish demonstrator qrcode from the spec", function() {
  var sepaqr = new sepaQR({
    charset: sepaQR.Charset.UTF_8,
    version: '001',
    benefName: 'Purjehdusseura Bitti ja Paatti Segelsällskapet Bit och Båt juhlat os.1',
    benefBIC: 'NDEAFIHH',
    benefAccNr: 'FI7331313001000058',
    amountEuro: 999999999.99,
    purpose: 'BEXP',
    creditorRef: '',
    remittanceInf: '140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext14',
    information: 'ReqdExctnDt/2014-01-02'
  });

  it("should be a valid payload", function() {
    expect(sepaqr.valid()).toBe(true);
  });

  it("should yield the same text as in the spec", function() {
    expect(sepaqr.toQRText()).toBe('BCD\n001\n1\nSCT\nNDEAFIHH\nPurjehdusseura Bitti ja Paatti Segelsällskapet Bit och Båt juhlat os.1\nFI7331313001000058\nEUR999999999.99\nBEXP\n\n140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext14\nReqdExctnDt/2014-01-02');
  });

});

describe("checking the maximum length in bytes", function() { // less characters, but counting after utf-8 conversion
  var sepaqr1 = new sepaQR({
    charset: sepaQR.Charset.UTF_8,
    version: '001',
    benefName: 'Purjehdusseura Bitti ja Paatti Segelsällskapet Bit och Båt juhlat os.1',
    benefBIC: 'NDEAFIHH',
    benefAccNr: 'FI7331313001000058',
    amountEuro: 1234.99,
    purpose: 'BEXP',
    creditorRef: '',
    remittanceInf: '140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext140charactersoffreetext14',
    information: 'ReqdExctnDt/2014-01-02 pushing to the last very Z äää'
  });

  it("should not be a valid payload", function() {
    expect(sepaqr1.valid()).toBe(false);
  });
});
