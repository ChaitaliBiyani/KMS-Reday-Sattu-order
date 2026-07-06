/**
 * Google Apps Script - Teej Order Emailer, Sheets Logger & Multi-Device Sync API (v3)
 * 
 * Instructions:
 * 1. Open Google Sheets.
 * 2. Click "Extensions" -> "Apps Script" in the top menu.
 * 3. Delete any existing code in the editor and paste this code.
 * 4. Click the "Save" icon (or press Ctrl + S).
 * 5. Click the "Deploy" button at the top right, then select "New deployment".
 * 6. Under "Select type", click the gear icon and choose "Web app".
 * 7. Configure:
 *    - Description: Teej Order Dispatcher v3
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone (This is critical so the website can submit orders to it).
 * 8. Click "Deploy". You might be prompted to "Authorize Access". Allow it.
 * 9. Copy the generated "Web app URL" (it ends with /exec).
 * 10. Open portal/app.js, find line 94 (const googleScriptURL = "..."), and paste your Web App URL.
 * 11. Upload app.js to GitHub!
 */

// Handle POST request from portal (Submission of new orders)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // Appends to the first sheet
    
    // Format items details for the spreadsheet cell
    var itemsDetail = "";
    data.items.forEach(function(item) {
      itemsDetail += item.productName + " (" + item.measure + ") x " + item.quantity + "\n";
    });
    
    // Append row: Timestamp, Order ID, Customer Name, Mobile, Email, Khetra, Payment Method, UPI ID, Total Qty, Total Cost, Items Detail
    sheet.appendRow([
      new Date(),
      data.id,
      data.customer,
      data.mobile,
      data.email,
      data.khetra,
      data.paymentMethod,
      data.upiId || "-",
      data.qty,
      data.total,
      itemsDetail
    ]);
    
    // Send HTML Email to Customer
    var tbodyHTML = "";
    data.items.forEach(function(item) {
      var displayName = item.productName + " (" + item.category + ")";
      tbodyHTML += '<tr>' +
        '<td style="padding: 8px; border: 1px solid #ddd;">' + displayName + '</td>' +
        '<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">' + item.measure + '</td>' +
        '<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">' + item.quantity + '</td>' +
        '<td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹' + item.price.toFixed(2) + '</td>' +
        '<td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹' + item.amount.toFixed(2) + '</td>' +
        '</tr>';
    });
    
    var emailBody = 
      '<div style="font-family: \'Outfit\', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; background: #fafafa; color: #1f2937;">' +
        '<div style="text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 15px; margin-bottom: 20px;">' +
          '<h2 style="color: #065f46; margin: 0; font-size: 1.6rem;">Kendriya Mahila Samiti</h2>' +
          '<p style="color: #d97706; font-weight: bold; margin: 5px 0 0 0; font-size: 1rem; letter-spacing: 0.5px;">Order Confirmation & Receipt</p>' +
        '</div>' +
        '<p>Dear <strong>' + data.customer + '</strong>,</p>' +
        '<p>Thank you for your order! We have received your request and are processing it.</p>' +
        '<div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">' +
          '<p style="margin: 0 0 8px 0; font-weight: bold; color: #111827;">Order Details:</p>' +
          '<table style="width: 100%; font-size: 0.9rem; line-height: 1.5; border-collapse: collapse;">' +
            '<tr><td style="color: #4b5563; width: 130px; padding: 3px 0;">Order ID:</td><td style="padding: 3px 0;"><strong>' + data.id + '</strong></td></tr>' +
            '<tr><td style="color: #4b5563; padding: 3px 0;">Khetra / Area:</td><td style="padding: 3px 0;">' + data.khetra + '</td></tr>' +
            '<tr><td style="color: #4b5563; padding: 3px 0;">Mobile Number:</td><td style="padding: 3px 0;">' + data.mobile + '</td></tr>' +
            '<tr><td style="color: #4b5563; padding: 3px 0;">Payment Method:</td><td style="padding: 3px 0;">' + data.paymentMethod + '</td></tr>' +
            (data.upiId && data.upiId !== "-" ? '<tr><td style="color: #4b5563; padding: 3px 0;">UPI Transaction ID:</td><td style="padding: 3px 0;"><strong>' + data.upiId + '</strong></td></tr>' : '') +
            '<tr><td style="color: #4b5563; padding: 3px 0;">Date/Time:</td><td style="padding: 3px 0;">' + data.timestamp + '</td></tr>' +
          '</table>' +
        '</div>' +
        '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">' +
          '<thead style="background: #f3f4f6; color: #374151; font-weight: bold;">' +
            '<tr>' +
              '<th style="padding: 10px 8px; border: 1px solid #ddd; text-align: left;">Product</th>' +
              '<th style="padding: 10px 8px; border: 1px solid #ddd; text-align: center;">Weight</th>' +
              '<th style="padding: 10px 8px; border: 1px solid #ddd; text-align: center;">Qty</th>' +
              '<th style="padding: 10px 8px; border: 1px solid #ddd; text-align: right;">Price</th>' +
              '<th style="padding: 10px 8px; border: 1px solid #ddd; text-align: right;">Amount</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' +
            tbodyHTML +
          '</tbody>' +
          '<tfoot>' +
            '<tr style="font-weight: bold; background: #f9fafb; color: #111827;">' +
              '<td colspan="4" style="padding: 10px 8px; border: 1px solid #ddd; text-align: right; font-size: 0.95rem;">Grand Total:</td>' +
              '<td style="padding: 10px 8px; border: 1px solid #ddd; text-align: right; color: #065f46; font-size: 0.95rem;">₹' + data.total.toFixed(2) + '</td>' +
            '</tr>' +
          '</tfoot>' +
        '</table>' +
        '<p style="font-size: 0.85rem; color: #6b7280; text-align: center; margin-top: 30px; border-top: 1px dashed #d1d5db; padding-top: 15px;">' +
          'This is an automatically generated email from Kendriya Mahila Samiti. Please do not reply directly.' +
        '</p>' +
      '</div>';
      
    // Send the email using Gmail Service
    MailApp.sendEmail({
      to: data.email,
      subject: "Order Confirmation - KMS Ready Sattu [Order ID: " + data.id + "]",
      htmlBody: emailBody
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

// Handle GET request from portal (Loading order history to display to Admin on both devices)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    var rows = sheet.getDataRange().getValues();
    
    var orders = [];
    
    // Headers: 0: Timestamp, 1: Order ID, 2: Customer Name, 3: Mobile, 4: Email, 5: Khetra, 6: Payment Method, 7: UPI ID, 8: Total Qty, 9: Total Cost, 10: Items Detail
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (row[1]) { // Verify Order ID exists
        orders.push({
          timestamp: row[0],
          id: row[1],
          customer: row[2],
          mobile: row[3],
          email: row[4],
          khetra: row[5],
          paymentMethod: row[6],
          upiId: row[7],
          qty: row[8],
          total: Number(row[9]),
          itemsText: row[10]
        });
      }
    }
    
    // Show newest first
    orders.reverse();
    
    return ContentService.createTextOutput(JSON.stringify(orders))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({ error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}
