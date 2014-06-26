var invoice, lineItems, lineItemCount;

function init() {
  invoice = {};
  lineItemCount = 1;
  $('#line-item-desc-0').on('change keyup blur', function() { lineItemDescChange(0); });
  $('#line-item-quantity-0').on('change keyup blur', function() { lineItemQuantityChange(0); });
  $('#line-item-amount-0').on('change keyup blur', function() { lineItemAmountChange(0); });
  $('#expiration').datetimepicker();
  prettyPrint();
}

//Form Reset
$('#form').on('reset', function(e){
  invoice = {};
  lineItems = null;
  lineItemCount = 1;
  $('#line-items').children('span:not(:first)').remove();
  $('#currency-req').hide();
  $('#line-item-missing').hide();
  $('#min-conf-req').hide();
  $('#line-item-req').hide();
  $('div').removeClass('has-error');
  $('span').removeClass('has-error');
  updateInvoiceJSON();
});

// Form Submit
$('#form').on('submit', function(e){
  var invalid = false;
  if (!invoice.currency) {
    $('#currency-req').show();
    invalid = true;
  }
  if (!invoice.min_confirmations) {
    $('#min-conf-req').show();
    invalid = true;
  }
  if (!invoice.line_items) {
    $('#line-item-req').show();
    invalid = true;
  }
  if (invoice.line_items) {
    var show = false;
    invoice.line_items.forEach(function(item) {
      if (!item.description || !item.quantity || !item.amount) {
        show = true;
      }
    });
    if (show) {
      $('#line-item-missing').show();
      invalid = true;
    }
  }
  if (invalid) {
    return e.preventDefault();
  }
  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: '/invoice',
    data: invoice,
    success: function() {
      alert('success');
      $(this)[0].reset();
    },
    error: function(jqXHR) {
      alert('Something bad happend' + jqXHR.responseText);
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
    var hide = true;
    lineItems.forEach(function(item) {
      if (item) {
        invoice.line_items.push(item);
        if (!item.description || !item.amount || !item.quantity) {
          hide = false;
        }
      }
    });
    if (hide) {
      $('#line-item-missing').hide();
    }
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
  var desc = $('#line-item-desc-' + num);
  var descVal = desc.val();
  if (descVal === '') {
    desc.parent().addClass('has-error');
  }
  else {
    desc.parent().removeClass('has-error');
  }
  lineItems = lineItems ? lineItems : [];
  lineItems[num] = lineItems[num] ? lineItems[num] : {};
  lineItems[num].description = descVal;
  if (lineItems[num].description && lineItems[num].quantity && lineItems[num].amount) {
    $('#line-item-req').hide();
  }
  updateInvoiceJSON();
};

var lineItemQuantityChange = function (num) {
  var quantity = $('#line-item-quantity-' + num);
  var quantityVal = quantity.val();
  var quantityInvalid = quantityVal === '' || Number(quantityVal) <= 0 || isNaN(quantityVal);
  if (quantityInvalid) {
    quantity.parent().addClass('has-error');
  }
  else {
    quantity.parent().removeClass('has-error');
  }
  lineItems = lineItems ? lineItems : [];
  lineItems[num] = lineItems[num] ? lineItems[num] : {};
  lineItems[num].quantity = quantityInvalid ? undefined : Number(quantityVal);
  if (lineItems[num].description && lineItems[num].quantity && lineItems[num].amount) {
    $('#line-item-req').hide();
  }
  updateInvoiceJSON();
};

var lineItemAmountChange = function (num) {
  var amount = $('#line-item-amount-' + num);
  var amountVal = amount.val();
  var amountInvalid = amountVal === '' || Number(amountVal) <= 0 || isNaN(amountVal);
  if (amountInvalid) {
    amount.parent().addClass('has-error');
  }
  else {
    amount.parent().removeClass('has-error');
  }
  lineItems = lineItems ? lineItems : [];
  lineItems[num] = lineItems[num] ? lineItems[num] : {};
  lineItems[num].amount = amountInvalid ? undefined : Number(amountVal);
  if (lineItems[num].description && lineItems[num].quantity && lineItems[num].amount) {
    $('#line-item-req').hide();
  }
  updateInvoiceJSON();
};

function addLineItem() {
  var html = '<span id="line-item-' + lineItemCount + '">';
  html += '<span><input class="form-control li-desc spacer-5" type="text" id="line-item-desc-' + lineItemCount + '" name="line-item-desc-' + lineItemCount + '" placeholder="Description of goods or services" required="true" /></span>&nbsp;';
  html += '<span><input class="form-control li-quantity" type="text" id="line-item-quantity-' + lineItemCount + '" name="line-item-quantity-' + lineItemCount + '" placeholder="Quantity" required="true"/></span>&nbsp;';
  html += '<span><input class="form-control li-amount" type="text" id="line-item-amount-' + lineItemCount + '" name="line-item-amount-' + lineItemCount + '" placeholder="Unit Price" required="true" /></span>&nbsp;';
  html += '<a href="javascript:void(0);" onclick="removeLineItem(' + lineItemCount + ');"><span class="glyphicon glyphicon-minus-sign"></span></a>';
  html += '</span>';
  $('#line-items').append(html);
  var index = lineItemCount;
  $('#line-item-desc-' + lineItemCount).on('change keyup blur', function() { lineItemDescChange(index); });
  $('#line-item-quantity-' + lineItemCount).on('change keyup blur', function() { lineItemQuantityChange(index); });
  $('#line-item-amount-' + lineItemCount).on('change keyup blur', function() { lineItemAmountChange(index); });
  lineItemCount++;
}

$('input:radio[name=currency]').click(function() {
  $('#currency-req').hide();
  invoice.currency = $(this).val() === '' ? undefined : $(this).val();
  updateInvoiceJSON();
});

$('#min-confirmations').on('click change keyup', function() {
  var confs = $(this).val();
  if (confs !=='') {
    $('#min-conf-req').hide();
  }
  var invalid = confs === '' || Number(confs) <= 0 || isNaN(confs);
  invoice.min_confirmations = invalid ? undefined : Number(confs);
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
  var valid = timestamp && timestamp > new Date().getTime();
  if (valid) {
    $(this).parent().removeClass('has-error');
  }
  else {
    $(this).parent().addClass('has-error');
  }
  invoice.expiration = timestamp && valid ? timestamp : undefined;
  updateInvoiceJSON();
});

init();