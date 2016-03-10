/**
 * @fileoverview
 *
 * @author kralo
 */
var sepaQR;

(function() {
  'use strict';
  //---------------------------------------------------------------------
  // SepaQR for JavaScript
  //
  // Copyright (c) 2015-2016 Max Schulze
  //
  // URL: http://sepaqr.eu
  //
  // Licensed under the MIT license:
  //   http://www.opensource.org/licenses/mit-license.php
  //
  //---------------------------------------------------------------------

  var sepaQRCharset = {
    UTF_8: 1,
    ISO8859_1: 2,
    ISO8859_2: 3,
    ISO8859_4: 4,
    ISO8859_5: 5,
    ISO8859_7: 6,
    ISO8859_10: 7,
    ISO8859_15: 8
  };


  /**
   * @class QRCode
   * @constructor
   * @example
   * new sepaQR({ benefName: 'Name of the recipient', benefBIC :'BIC', benefAccNr : 'EUXXX1234', amountEuro : 99.99, purpose : 'BEXP', remittanceInf :'140charactersoffreetext'});
   *
   */
  sepaQR = function(vOption) {
    this._sOpt = {
      serviceTag: "BCD",
      version: "001",
      charset: sepaQRCharset.UTF_8, // better always choose utf-8
      identificationCode: "SCT", // for S_EPA-C_redit T_ransfer, should be the standard-case
      benefBIC: "",
      benefName: "",
      benefAccNr: "",
      amountEuro: "",
      purpose: "",
      creditorRef: "",
      remittanceInf: "",
      information: ""
    };

    // Overwrites options
    if (vOption) {
      for (var i in vOption) {
        this._sOpt[i] = vOption[i];
      }
    }

  };

  sepaQR.prototype.validServiceTag = function() {
    return (this._sOpt.serviceTag === "BCD");
  };
  sepaQR.prototype.validVersion = function() {
    return (this._sOpt.version === "001" || this._sOpt.version === "002");
  };
  sepaQR.prototype.validCharset = function() {
    return (this._sOpt.charset > 0 && this._sOpt.charset <= 8);
  };
  sepaQR.prototype.validIdentificationCode = function() {
    return (this._sOpt.identificationCode === "SCT");
  };
  sepaQR.prototype.validBenefName = function() {
    var valid = (typeof this._sOpt.benefName == "string") && (this._sOpt.benefName.length >= 1) && (this._sOpt.benefName.length <= 70);
    if (!valid) {
      throw new Error("benefName not valid!");
    }
    return valid;
  };
  sepaQR.prototype.validBenefAccNr = function() {
    var valid = (typeof this._sOpt.benefAccNr == "string") && (this._sOpt.benefAccNr.length >= 1) && (this._sOpt.benefAccNr.length <= 34);
    if (!valid) {
      throw new Error("benefAccNr not valid!");
    }
    return valid;
  };

  sepaQR.prototype.validAmountEuro = function() {
    //either be empty,
    if (typeof this._sOpt.amountEuro == "string") {
      return (this._sOpt.amountEuro.length === 0);
    } else if (typeof this._sOpt.amountEuro == "number") {
      this._sOpt.amountEuro = Math.round(this._sOpt.amountEuro * 100) / 100;
        // the limit of 999999999.99 is directly from the spec!
      var valid = (this._sOpt.amountEuro > 0.01) && (this._sOpt.amountEuro <= 999999999.99);
      if (!valid) {
        throw new Error("Amount not valid!");
      }
      return valid;
    }
  };

  sepaQR.prototype.validBenefBic = function() {
    var valid = (this._sOpt.version == "002") || (typeof this._sOpt.benefBIC == "string") && (this._sOpt.benefBIC.length >= 0) && (this._sOpt.benefBIC.length <= 11);
    if (!valid) {
      throw new Error("BIC is mandatory in Version 001!");
    }
    valid = (typeof this._sOpt.benefBIC == "string") && (this._sOpt.benefBIC.length >= 0) && (this._sOpt.benefBIC.length <= 11);
    if (!valid) {
      throw new Error("benefBIC not valid!");
    }
    return valid;
  };

  sepaQR.prototype.validPurpose = function() {
    var valid = (typeof this._sOpt.purpose == "string") && (this._sOpt.purpose.length >= 0) && (this._sOpt.purpose.length <= 4);
    if (!valid) {
      throw new Error("Purpose not valid!");
    }
    return valid;
  };

  sepaQR.prototype.validInformation = function() {
    var valid = (typeof this._sOpt.information == "string") && (this._sOpt.information.length >= 0) && (this._sOpt.information.length <= 70);
    if (!valid) {
      throw new Error("Information not valid!");
    }
    return valid;

  };

  sepaQR.prototype.validCreditorRefOrRemittance = function() {
    var creditorRef_empty = (typeof this._sOpt.creditorRef == "string") && (this._sOpt.creditorRef.length === 0);
    var remittanceInf_empty = (typeof this._sOpt.remittanceInf == "string") && (this._sOpt.remittanceInf.length === 0);

    var valid = creditorRef_empty && (typeof this._sOpt.remittanceInf == "string") && (this._sOpt.remittanceInf.length <= 140) ||
      remittanceInf_empty && (typeof this._sOpt.creditorRef == "string") && (this._sOpt.creditorRef.length <= 35);
    if (!valid) {
      throw new Error("creditorRef or Remittance not valid!");
    }
    return valid;
  };

  sepaQR.prototype.validQRTextLength = function() {
    var text = this.prepareQRText();
    var bytecounter = 0;

    for (var i = 0, l = text.length; i < l; i++) {
      var byteArray = [];
      var code = text.charCodeAt(i);

      if (code > 0x10000) {
        bytecounter += 4;
      } else if (code > 0x800) {
        bytecounter += 3;
      } else if (code > 0x80) {
        bytecounter += 2;
      } else {
        bytecounter += 1;
      }

    }
    return (bytecounter <= 328); // originally <=331 bytes, but library seems to do some sort of padding
  };

  sepaQR.prototype.valid = function() {
    var valid = (this.validServiceTag() && this.validVersion() && this.validCharset() && this.validIdentificationCode() && this.validBenefName() && this.validBenefAccNr() &&
      this.validAmountEuro() && this.validBenefBic() && this.validPurpose() && this.validInformation() && this.validPurpose() && this.validCreditorRefOrRemittance() &&
      this.validQRTextLength());

    return valid;
  };

  sepaQR.prototype.prepareQRText = function() {
    // the spec says nothing about trimming empty lines at the end, we trim for saving bytes
    return (this._sOpt.serviceTag + "\n" +
      this._sOpt.version + "\n" +
      this._sOpt.charset + "\n" +
      this._sOpt.identificationCode + "\n" +
      this._sOpt.benefBIC + "\n" +
      this._sOpt.benefName + "\n" +
      this._sOpt.benefAccNr + "\n" +
      "EUR" + this._sOpt.amountEuro + "\n" +
      this._sOpt.purpose + "\n" +
      this._sOpt.creditorRef + "\n" +
      this._sOpt.remittanceInf + "\n" +
      this._sOpt.information).trim();
  };

  sepaQR.prototype.toQRText = function() {
    if (!this.valid())
      return "";
    return this.prepareQRText();
  };

  sepaQR.prototype.makeCodeInto = function(elem, vOptions) {
    var options = {
      width: 256,
      height: 256,
      mmPerDot: 0.85, // > 0.75, better 0.9
      dpi: 92,
      correctLevel: QRCodep.CorrectLevel.M,
      text: this.toQRText()
    };

    if (options.text.length === 0) return;
    // Overwrites options
    if (vOptions) {
      for (var i in vOptions) {
        options[i] = vOptions[i];
      }
    }

    this.qrcode = new QRCodep(elem, options);
    this.drawExplanatoryLink(document.getElementById(elem).getElementsByTagName("canvas")[0], document.createElement('canvas'));
    return this.qrcode;
  };

  sepaQR.prototype.drawExplanatoryLink = function(canvas, tempCanvas) {
    // -- Draw explanatory link around
    var rectLineWidth = 3; // px
    var rectRadius = 12; // px
    var codeRectDist = 8; // px, >> sqrt(2)*RectRadius
    var RectBorderDist = 6; //px
    var myCanvas = canvas;

    tempCanvas.width = myCanvas.width;
    tempCanvas.height = myCanvas.height;

    // save canvas into temp canvas
    tempCanvas.getContext('2d').drawImage(myCanvas, 0, 0);

    // resize my canvas as needed
    myCanvas.width = tempCanvas.width + 2 * (codeRectDist + rectLineWidth + RectBorderDist);
    myCanvas.height = tempCanvas.height + 2 * (codeRectDist + rectLineWidth + RectBorderDist);

    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r, right) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.lineTo(x + w - right, y + h);
      this.moveTo(x + w - 110, y + h);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      //this.closePath();
      return this;
    };

    var context = myCanvas.getContext('2d');
    context.fillStyle = 'white';
    context.rect(0, 0, myCanvas.width, myCanvas.height); // fill with white background
    context.fill();

    // draw temp canvas back into myCanvas
    context.drawImage(tempCanvas, codeRectDist + rectLineWidth + RectBorderDist, codeRectDist + rectLineWidth + RectBorderDist);

    context.lineWidth = rectLineWidth; // in pixels
    context.roundRect(RectBorderDist + rectLineWidth / 2, RectBorderDist + rectLineWidth / 2, myCanvas.width - rectLineWidth - 2 * RectBorderDist, myCanvas.height - rectLineWidth - 2 * RectBorderDist, rectRadius, 3 * codeRectDist).stroke(); //or .fill() for a filled rect

    context.fillStyle = 'black';
    context.font = rectLineWidth * 4.5 + "px Arial";
    context.fillText("sepaQR.eu", myCanvas.width - 110, myCanvas.height - RectBorderDist / 2);
  };

  sepaQR.Charset = sepaQRCharset;
})();
