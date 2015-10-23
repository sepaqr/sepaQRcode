# sepaQRcode
*No more typing of IBAN, BIC, Beneficiary and References!*

This library lets you create QRcodes that contain the information you need for SEPA credit transfers according to the standard EPC069-12, V2.0 2 July 2015 of the European Payments Council. This codes can be read by many online-banking apps.

## Known limitations

The Charset value is currently ignored and as default set to UTF-8. You should be safe if you input your text (receiver, references) as UTF-8 as well. Essentially the qr-encoded data itself does not contain any charset information and it is up to the decoding party (smartphone, etc.) to decide what to do - so better always stick to UTF-8.
