var invoice, lineItems, lineItemCount;

function init() {
  invoice = {};
  lineItemCount = 1;
  $('#line-item-desc-0').on('change keyup', function() { lineItemDescChange(0); });
  $('#line-item-quantity-0').on('change keyup', function() { lineItemQuantityChange(0); });
  $('#line-item-amount-0').on('change keyup', function() { lineItemAmountChange(0); });
  $('#expiration').datetimepicker();
  prettyPrint();
}

$('#form').on('submit', function(e){
  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: '/invoice',
    data: invoice,
    success: function() {
      alert('success');
    },
    error: function(jqXHR) {
      if (jqXHR.status === 200) {
        alert('Invoice created! ' + jqXHR.responseText);
      }
      else {
        alert('Something bad happend' + jqXHR.responseText);
      }
    }
  });
});

function sortObject(o) {
  var sorted = {},
  key, a = [];
  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }
  a.sort();
  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}

function updateInvoiceJSON() {
  if (lineItems) {
    invoice.line_items = [];
    lineItems.forEach(function(item) {
      if (item) {
        invoice.line_items.push(item);
      }
    });
  }
  var invoiceStr = JSON.stringify(sortObject(invoice), null, 2);
  invoiceStr = invoiceStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  var jsonHTML = '<pre class="prettyprint">var invoice = ' + invoiceStr + ';</pre>';
  $('#invoice-pre').html(jsonHTML);
  prettyPrint();
}

function removeLineItem(num) {
  if (lineItems && lineItems[num]) {
    lineItems[num] = undefined;
  }
  $('#line-item-' + num).remove();
  updateInvoiceJSON();
}

var lineItemDescChange = function (num) {
  lineItems = lineItems ? lineItems : [];
  lineItems[num] = lineItems[num] ? lineItems[num] : {};
  lineItems[num].description = $('#line-item-desc-' + num).val();
  updateInvoiceJSON();
};

var lineItemQuantityChange = function (num) {
  lineItems = lineItems ? lineItems : [];
  lineItems[num] = lineItems[num] ? lineItems[num] : {};
  lineItems[num].quantity = Number($('#line-item-quantity-' + num).val());
  updateInvoiceJSON();
};

var lineItemAmountChange = function (num) {
  lineItems = lineItems ? lineItems : [];
  lineItems[num] = lineItems[num] ? lineItems[num] : {};
  lineItems[num].amount = Number($('#line-item-amount-' + num).val());
  updateInvoiceJSON();
};

function addLineItem() {
  var html = '<span id="line-item-' + lineItemCount + '">';
  html += '<input class="form-control li-desc spacer-5" type="text" id="line-item-desc-' + lineItemCount + '" name="line-item-desc-' + lineItemCount + '" placeholder="Description of goods or services" required /> ';
  html += '<input class="form-control li-quantity" type="text" id="line-item-quantity-' + lineItemCount + '" name="line-item-quantity-' + lineItemCount + '" placeholder="Quantity" required/> ';
  html += '<input class="form-control li-amount" type="text" id="line-item-amount-' + lineItemCount + '" name="line-item-amount-' + lineItemCount + '" placeholder="Unit Price" required /> ';
  html += '<a href="javascript:void(0);" onclick="removeLineItem(' + lineItemCount + ');"><span class="glyphicon glyphicon-minus-sign"></span></a>';
  html += '</span>';
  $('#line-items').append(html);
  var index = lineItemCount;
  $('#line-item-desc-' + lineItemCount).on('change keyup', function() { lineItemDescChange(index); });
  $('#line-item-quantity-' + lineItemCount).on('change keyup', function() { lineItemQuantityChange(index); });
  $('#line-item-amount-' + lineItemCount).on('change keyup', function() { lineItemAmountChange(index); });
  lineItemCount++;
}

$('input:radio[name=currency]').click(function() {
  invoice.currency = $(this).val() === '' ? undefined : $(this).val();
  updateInvoiceJSON();
});

$('#min-confirmations').on('click change keyup', function() {
  invoice.min_confirmations = Number($(this).val()) === -1 ? undefined : Number($(this).val());
  updateInvoiceJSON();
});

$('#title').on('change keyup', function() {
  invoice.title = $(this).val() === '' ? undefined : $(this).val();
  updateInvoiceJSON();
});

$('#text').on('change keyup', function() {
  invoice.text = $(this).val() === '' ? undefined : $(this).val();
  updateInvoiceJSON();
});

$('#expiration').on('blur change keyup', function() {
  var timestamp = Date.parse($(this).val());
  invoice.expiration = timestamp ? timestamp : undefined;
  updateInvoiceJSON();
});

init();